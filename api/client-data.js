import { getSupabase, corsHeaders, validateSession } from './_utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({}, { headers: corsHeaders });
    }

    const supabase = getSupabase();
    let user;

    try {
        user = await validateSession(req);
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: ' + err.message }, { headers: corsHeaders });
    }

    const userId = user.id; // Securely obtained from session

    // GET: Fetch User Data (Plans & History)
    if (req.method === 'GET') {
        try {
            // Parallel Fetch
            constplansPromise = supabase.from('user_plans').select('*').eq('user_id', userId).eq('active', true);
            const sessionsPromise = supabase.from('user_sessions').select('*').eq('user_id', userId).order('date', { ascending: false });

            const [plansRes, sessionsRes] = await Promise.all([plansPromise, sessionsPromise]);

            if (plansRes.error) throw plansRes.error;
            if (sessionsRes.error) throw sessionsRes.error;

            // Calculate Level from Sessions (Simple Logic)
            const totalXp = sessionsRes.data.reduce((acc, sess) => acc + (sess.xp_earned || 0), 0);

            // Level formula: 1 level per 500 XP
            // Lvl 1: 0-499
            // Lvl 2: 500-999
            const level = Math.floor(totalXp / 500) + 1;

            return res.status(200).json({
                plans: plansRes.data || [],
                history: sessionsRes.data || [],
                gamification: {
                    level,
                    totalXp,
                    nextLevelXp: 500, // Fixed step for now
                    currentLevelXp: totalXp % 500
                }
            }, { headers: corsHeaders });

        } catch (err) {
            return res.status(500).json({ error: err.message }, { headers: corsHeaders });
        }
    }

    // POST: Save Session or Update Plan
    if (req.method === 'POST') {
        const { action, payload } = req.body;
        // action: 'complete_session' | 'update_plan' | 'join_plan'

        if (!action) return res.status(400).json({ error: 'Missing fields' }, { headers: corsHeaders });

        try {
            if (action === 'complete_session') {
                // payload: { title, stats, xp, unitId, planId }

                // 1. Save Session
                const { error: sessError } = await supabase.from('user_sessions').insert({
                    user_id: userId,
                    title: payload.title || 'Trening',
                    stats: payload.stats || {},
                    xp_earned: payload.xp || 100,
                    date: new Date().toISOString()
                });
                if (sessError) throw sessError;

                // 2. Update Plan Progress if linked to a plan
                if (payload.planId && payload.unitId) {
                    // Fetch current plan data first to append unit
                    const { data: planData } = await supabase.from('user_plans').select('progress').eq('user_id', userId).eq('plan_id', payload.planId).single();

                    if (planData) {
                        const currentProgress = planData.progress || { completed_units: [] };
                        const newCompleted = [...(currentProgress.completed_units || []), payload.unitId];
                        // Unique
                        const uniqueCompleted = [...new Set(newCompleted)];

                        await supabase.from('user_plans').update({
                            progress: { ...currentProgress, completed_units: uniqueCompleted }
                        }).eq('user_id', userId).eq('plan_id', payload.planId);
                    }
                }

                return res.status(200).json({ success: true }, { headers: corsHeaders });
            }

            if (action === 'join_plan' || action === 'add_plan') {
                // payload: { planId }

                const { error: insertError } = await supabase.from('user_plans').insert({
                    user_id: userId,
                    plan_id: payload.planId,
                    active: true,
                    progress: { completed_units: [] }
                });

                if (insertError) {
                    if (insertError.code === '23505') {
                        // Already exists, just set active=true
                        await supabase.from('user_plans').update({ active: true }).eq('user_id', userId).eq('plan_id', payload.planId);
                    } else {
                        throw insertError;
                    }
                }

                return res.status(200).json({ success: true }, { headers: corsHeaders });
            }

            if (action === 'remove_plan') {
                const { error } = await supabase.from('user_plans').update({ active: false }).eq('user_id', userId).eq('plan_id', payload.planId);
                if (error) throw error;
                return res.status(200).json({ success: true }, { headers: corsHeaders });
            }

            return res.status(400).json({ error: 'Unknown action' }, { headers: corsHeaders });

        } catch (err) {
            return res.status(500).json({ error: err.message }, { headers: corsHeaders });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' }, { headers: corsHeaders });
}

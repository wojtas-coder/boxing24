import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { plansLibrary } from '../data/trainingPlan';

export const useClientData = () => {
    const { user, session } = useAuth();
    const [clientData, setClientData] = useState({
        plans: [],
        history: [],
        gamification: { level: 1, currentLevelXp: 0, nextLevelXp: 500 },
        stats: { strength: 0, knowledge: 0, discipline: 0, overall: 0 },
        bookings: { upcoming: [], history: [] },
        loading: true,
        error: null
    });

    const [dbPlans, setDbPlans] = useState([]);

    useEffect(() => {
        if (!user || !session) return;

        const fetchData = async () => {
            try {
                // 1. Fetch Client Profile Data (Already in AuthContext, but let's be sure or fetch extras)
                // Actually, let's fetch session history and stats from 'client_activity' or similar
                // For now, let's mock or use what we have in Supabase

                // 2. Fetch Workouts (Bookings) from 'bookings' table
                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('client_email', user.email);

                if (bookingsError) throw bookingsError;

                const upcoming = bookingsData?.filter(b => new Date(b.start_time) > new Date()) || [];
                const history = bookingsData?.filter(b => new Date(b.start_time) <= new Date()) || [];

                // 3. Fetch Dynamic Plans from 'training_plans' table
                const { data: plansData, error: plansError } = await supabase
                    .from('training_plans')
                    .select('*');

                if (plansError) {
                    console.warn("Training plans table fetch failed, using fallback.");
                }

                setClientData(prev => ({
                    ...prev,
                    bookings: { upcoming, history },
                    loading: false
                }));

                if (plansData) {
                    setDbPlans(plansData.map(p => ({
                        ...p,
                        id: p.id.toString(),
                        image: p.image || 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop',
                        locked: false
                    })));
                }

            } catch (err) {
                console.error("useClientData error:", err);
                setClientData(prev => ({ ...prev, error: err, loading: false }));
            }
        };

        fetchData();
    }, [user, session]);

    const allPlans = [...plansLibrary, ...dbPlans];

    return { ...clientData, allPlans, refresh: () => { } };
};

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
                // 1. Fetch Client Data (Plans, History, Gamification)
                const clientRes = await fetch('/api/client-data', {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                const data = clientRes.ok ? await clientRes.json() : null;

                // 2. Fetch Workouts (Bookings)
                const bookingsRes = await fetch('/api/client-bookings', {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                const bookings = bookingsRes.ok ? await bookingsRes.json() : { upcoming: [], history: [] };

                // 3. Fetch Dynamic Plans
                const plansRes = await fetch('/api/training-plans');
                const plansData = plansRes.ok ? await plansRes.json() : { plans: [] };

                setClientData(prev => ({
                    ...prev,
                    plans: data?.plans || [],
                    history: data?.history || [],
                    gamification: data?.gamification || prev.gamification,
                    stats: data?.stats || prev.stats,
                    bookings: bookings,
                    loading: false
                }));

                setDbPlans(plansData.plans.map(p => ({
                    ...p,
                    id: p.id.toString(),
                    image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop',
                    locked: false
                })));

            } catch (err) {
                console.error("useClientData error:", err);
                setClientData(prev => ({ ...prev, error: err, loading: false }));
            }
        };

        fetchData();
    }, [user, session]);

    const allPlans = [...plansLibrary, ...dbPlans];

    return { ...clientData, allPlans, refresh: () => { } }; // Simplified for now
};

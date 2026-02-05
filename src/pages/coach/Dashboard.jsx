import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, Activity, Calendar, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CoachDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ clients: 0, activePlans: 0, pendingReviews: 0 });
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchCoachData();
    }, [user]);

    const fetchCoachData = async () => {
        try {
            // 1. Fetch relationships (clients)
            // Note: In real app we would join with profiles, but for now we get IDs
            const { data: relationships, error } = await supabase
                .from('relationships')
                .select('client_id, status')
                .eq('coach_id', user.id)
                .eq('status', 'active');

            if (error) throw error;

            const clientIds = relationships.map(r => r.client_id);

            // 2. Fetch Client Profiles
            let clientProfiles = [];
            if (clientIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', clientIds);
                clientProfiles = profiles || [];
            }

            setClients(clientProfiles);
            setStats({
                clients: clientProfiles.length,
                activePlans: 0, // Placeholder
                pendingReviews: 0 // Placeholder
            });

        } catch (err) {
            console.error("Coach data error:", err);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden">
            <div className={`p-3 rounded-lg w-fit mb-4 ${color.replace('text-', 'bg-').replace('500', '500/10')} ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
        </div>
    );

    if (loading) return <div className="p-10 text-center text-zinc-500">Ładowanie panelu trenera...</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                    Witaj <span className="text-blue-600">Trenerze</span>
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Twój Zespół i Plany Treningowe</p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Moi Zawodnicy" value={stats.clients} color="text-blue-500" />
                <StatCard icon={Activity} label="Aktywne Plany" value={stats.activePlans} color="text-green-500" />
                <StatCard icon={Calendar} label="Dzisiejsze Treningi" value="0" color="text-yellow-500" />
                <StatCard icon={Trophy} label="Osiągnięcia" value="0" color="text-purple-500" />
            </div>

            {/* Clients List */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="text-blue-600" /> Twoi Podopieczni
                </h3>

                {clients.length > 0 ? (
                    <div className="grid gap-4">
                        {clients.map(client => (
                            <div key={client.id} className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center hover:border-blue-600/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                                        {client.full_name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{client.full_name}</div>
                                        <div className="text-xs text-zinc-500">Status: Aktywny</div>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-blue-600/10 text-blue-500 rounded-lg text-xs font-bold uppercase hover:bg-blue-600 hover:text-white transition-all">
                                    Zobacz Profil
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nie masz jeszcze przypisanych zawodników.</p>
                        <p className="text-xs mt-2">Poproś Admina o przypisanie klientów do Twojego konta.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoachDashboard;

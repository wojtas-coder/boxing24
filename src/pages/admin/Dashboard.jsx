import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, Newspaper, Activity, TrendingUp, ShieldAlert, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { session } = useAuth(); // Get auth state
    const [stats, setStats] = useState({ users: '-', news: '-', serverStatus: 'Online' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        fetchStats(mounted);
        return () => { mounted = false; };
    }, []);

    const fetchStats = async (mounted = true) => {
        setLoading(true);
        try {
            // Count users
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            // Count news
            const { count: newsCount } = await supabase.from('news').select('*', { count: 'exact', head: true });

            if (mounted) {
                setStats({
                    users: usersCount !== null ? usersCount : 0,
                    news: newsCount !== null ? newsCount : 0,
                    serverStatus: 'Online'
                });
            }
        } catch (err) {
            console.error("Dash Error:", err);
            if (mounted) setStats(prev => ({ ...prev, serverStatus: 'Data Error' }));
        } finally {
            if (mounted) setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-all">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon className="w-24 h-24" />
            </div>
            <div className="relative z-10">
                <div className={`p-3 rounded-lg w-fit mb-4 ${color.replace('text-', 'bg-').replace('500', '500/10')} ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-black text-white mb-1">
                    {value}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* System Status Banner */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${stats.serverStatus === 'Online' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 animate-pulse'}`} />
                    <div>
                        <div className="text-white font-bold text-sm">Status Systemu: {stats.serverStatus}</div>
                        <div className="text-zinc-500 text-xs font-mono">
                            DB: {stats.serverStatus === 'Online' ? 'Połączono' : 'Błąd Połączenia'} |
                            Auth: {session ? 'Zalogowano' : 'Brak Sesji'}
                        </div>
                    </div>
                </div>
                <button onClick={() => fetchStats()} className={`p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`}>
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                    Dashboard <span className="text-red-600">Admina</span> <span className="text-xs bg-red-600 px-2 py-1 rounded text-white ml-2 not-italic align-middle tracking-normal font-sans">V2.0 LIVE</span>
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Centrum Operacyjne Boxing24 (Online) </p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Zarejestrowani" value={stats.users} color="text-blue-500" />
                <StatCard icon={Newspaper} label="Opublikowane Newsy" value={stats.news} color="text-green-500" />
                <StatCard icon={Activity} label="Status Systemu" value={stats.serverStatus} color="text-purple-500" />
                <StatCard icon={ShieldAlert} label="Incydenty" value="0" color="text-red-500" />
            </div>

            {/* RECENT ACTIVITY PLACEHOLDER */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 min-h-[300px] flex items-center justify-center dashed-border">
                <div className="text-center opacity-50">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                    <p className="text-zinc-500 font-mono text-sm">Wykresy aktywności pojawią się wkrótce...</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

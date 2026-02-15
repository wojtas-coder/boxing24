import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, Newspaper, Activity, ShieldAlert, RefreshCw, Clock, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { session } = useAuth();
    const [stats, setStats] = useState({ users: '-', news: '-', incidents: '-', serverStatus: 'Online' });
    const [recentActivity, setRecentActivity] = useState([]);
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

            // Fetch recent activity (last 5 users + last 5 news)
            const { data: recentUsers } = await supabase
                .from('profiles')
                .select('full_name, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            const { data: recentNews } = await supabase
                .from('news')
                .select('title, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            // Merge and sort activity feed
            const activity = [
                ...(recentUsers || []).map(u => ({
                    type: 'user',
                    label: u.full_name || 'Nowy użytkownik',
                    time: u.created_at
                })),
                ...(recentNews || []).map(n => ({
                    type: 'news',
                    label: n.title,
                    time: n.created_at
                }))
            ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

            if (mounted) {
                setStats({
                    users: usersCount !== null ? usersCount : 0,
                    news: newsCount !== null ? newsCount : 0,
                    incidents: 0,
                    serverStatus: 'Online'
                });
                setRecentActivity(activity);
            }
        } catch (err) {
            console.error("Dash Error:", err);
            if (mounted) setStats(prev => ({ ...prev, serverStatus: 'Data Error' }));
        } finally {
            if (mounted) setLoading(false);
        }
    };

    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m temu`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h temu`;
        const days = Math.floor(hours / 24);
        return `${days}d temu`;
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
                    Dashboard <span className="text-red-600">Admina</span> <span className="text-xs bg-red-600 px-2 py-1 rounded text-white ml-2 not-italic align-middle tracking-normal font-sans">V2.1 LIVE</span>
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Centrum Operacyjne Boxing24 (Online) </p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Zarejestrowani" value={stats.users} color="text-blue-500" />
                <StatCard icon={Newspaper} label="Opublikowane Newsy" value={stats.news} color="text-green-500" />
                <StatCard icon={Activity} label="Status Systemu" value={stats.serverStatus} color="text-purple-500" />
                <StatCard icon={ShieldAlert} label="Incydenty" value={stats.incidents} color="text-red-500" />
            </div>

            {/* RECENT ACTIVITY – Real Data */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-5 h-5 text-zinc-500" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Ostatnia Aktywność</h3>
                </div>

                {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                        {recentActivity.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                                <div className={`p-2 rounded-lg ${item.type === 'user' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                    {item.type === 'user' ? <UserPlus className="w-4 h-4" /> : <Newspaper className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-white font-medium truncate">{item.label}</div>
                                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest">
                                        {item.type === 'user' ? 'Nowa rejestracja' : 'Nowy artykuł'}
                                    </div>
                                </div>
                                <div className="text-xs text-zinc-600 font-mono flex-shrink-0">{timeAgo(item.time)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 opacity-50">
                        <p className="text-zinc-500 font-mono text-sm">Brak ostatniej aktywności.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

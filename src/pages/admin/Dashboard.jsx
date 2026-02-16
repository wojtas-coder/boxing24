import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, Newspaper, Activity, ShieldAlert, RefreshCw, Clock, UserPlus, AlertTriangle, Crown, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { session } = useAuth();
    const [stats, setStats] = useState({ users: 0, news: 0, premium: 0, serverStatus: 'Sprawdzanie...' });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        // Safety timeout - NEVER load forever
        const timeout = setTimeout(() => {
            if (mounted && loading) {
                setLoading(false);
                setError('Timeout: Nie udało się pobrać danych. Sprawdź uprawnienia w Supabase (RLS).');
                setStats(prev => ({ ...prev, serverStatus: 'RLS Error' }));
            }
        }, 5000);

        fetchStats(mounted);

        return () => { mounted = false; clearTimeout(timeout); };
    }, []);

    const fetchStats = async (mounted = true) => {
        setLoading(true);
        setError(null);
        try {
            // Count users
            const { count: usersCount, error: usersErr } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (usersErr) throw new Error(`Profiles: ${usersErr.message}`);

            // Count news
            const { count: newsCount, error: newsErr } = await supabase
                .from('news')
                .select('*', { count: 'exact', head: true });

            if (newsErr) throw new Error(`News: ${newsErr.message}`);

            // Count premium users
            let premiumCount = 0;
            try {
                const { count } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .in('membership_status', ['member', 'premium', 'vip']);
                premiumCount = count || 0;
            } catch (e) { /* column may not exist yet */ }

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
                    users: usersCount ?? 0,
                    news: newsCount ?? 0,
                    premium: premiumCount,
                    serverStatus: 'Online'
                });
                setRecentActivity(activity);
                setError(null);
            }
        } catch (err) {
            console.error("Dashboard Error:", err);
            if (mounted) {
                setError(err.message);
                setStats(prev => ({ ...prev, serverStatus: 'Błąd Danych' }));
            }
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
                    {loading ? '...' : value}
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
                            DB: {stats.serverStatus === 'Online' ? 'Połączono' : 'Problem z Połączeniem'} |
                            Auth: {session ? 'Zalogowano' : 'Nie zalogowano'}
                        </div>
                    </div>
                </div>
                <button onClick={() => fetchStats(true)} className={`p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`}>
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-red-400 font-bold mb-1">Problem z dostępem do danych</h3>
                        <p className="text-red-300/70 text-sm mb-3">{error}</p>
                        <div className="text-red-300/50 text-xs space-y-1">
                            <p>Możliwe przyczyny:</p>
                            <ul className="list-disc list-inside ml-2">
                                <li>Nie jesteś zalogowany jako admin</li>
                                <li>Twój profil nie ma roli 'admin' w tabeli profiles</li>
                                <li>RLS (Row Level Security) blokuje zapytania</li>
                            </ul>
                            <p className="mt-2">Rozwiązanie: Uruchom skrypt <code className="bg-red-900/30 px-1 rounded">scripts/emergency_admin_fix.sql</code> w Supabase SQL Editor</p>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                    Dashboard <span className="text-red-600">Admina</span> <span className="text-xs bg-red-600 px-2 py-1 rounded text-white ml-2 not-italic align-middle tracking-normal font-sans">V3.0 LIVE</span>
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Centrum Operacyjne Boxing24</p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Zarejestrowani" value={stats.users} color="text-blue-500" />
                <StatCard icon={Newspaper} label="Opublikowane Newsy" value={stats.news} color="text-green-500" />
                <StatCard icon={Crown} label="Premium" value={stats.premium} color="text-amber-500" />
                <StatCard icon={Activity} label="Status" value={stats.serverStatus} color="text-purple-500" />
            </div>

            {/* RECENT ACTIVITY */}
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
                        <p className="text-zinc-500 font-mono text-sm">
                            {error ? 'Nie można pobrać aktywności.' : 'Brak ostatniej aktywności.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

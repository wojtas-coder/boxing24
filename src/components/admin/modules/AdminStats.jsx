import React, { useEffect, useState } from 'react';
import { supabaseData as supabase } from '../../../lib/supabaseClient';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Newspaper, BookOpen, ImageIcon, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

const AdminStats = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        recentUsers: 0,
        totalNews: 0,
        breakingNews: 0,
        totalKnowledge: 0,
        premiumKnowledge: 0,
        totalMediaCount: 0,
        chartData: []
    });
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            // 1. Users Data (Total & Last 30 days for chart)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

            const [
                { count: totalUsers, error: usersError1 },
                { data: recentUsersData, error: usersError2 },
                { count: totalNews, error: newsError1 },
                { count: breakingNews, error: newsError2 },
                { count: totalKnowledge, error: kError1 },
                { count: premiumKnowledge, error: kError2 },
                { data: mediaFiles, error: mediaError }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo),
                supabase.from('news').select('*', { count: 'exact', head: true }),
                supabase.from('news').select('*', { count: 'exact', head: true }).eq('is_breaking', true),
                supabase.from('knowledge_articles').select('*', { count: 'exact', head: true }),
                supabase.from('knowledge_articles').select('*', { count: 'exact', head: true }).or('is_premium.eq.true,has_dual_version.eq.true'),
                supabase.storage.from('media').list('', { limit: 1000 })
            ]);

            if (usersError1) throw usersError1;
            if (usersError2) throw usersError2;
            if (newsError1) throw newsError1;
            if (newsError2) throw newsError2;
            if (kError1) throw kError1;
            if (kError2) throw kError2;

            // Media error might just mean empty bucket, don't crash the whole page
            if (mediaError && !mediaError.message.includes('not found')) {
                console.warn("Storage fetch warning:", mediaError);
            }

            // Generate Chart Data (Last 30 Days)
            const days = [];
            for (let i = 29; i >= 0; i--) {
                const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                const dateStr = date.toISOString().split('T')[0];
                const signups = recentUsersData?.filter(u => u.created_at?.startsWith(dateStr)).length || 0;
                days.push({
                    name: date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
                    signups: signups
                });
            }

            const validMediaFilesCount = mediaFiles?.filter(f => f.name !== '.emptyFolderPlaceholder').length || 0;

            setStats({
                totalUsers: totalUsers || 0,
                recentUsers: recentUsersData?.length || 0,
                totalNews: totalNews || 0,
                breakingNews: breakingNews || 0,
                totalKnowledge: totalKnowledge || 0,
                premiumKnowledge: premiumKnowledge || 0,
                totalMediaCount: validMediaFilesCount,
                chartData: days
            });

        } catch (err) {
            console.error("Stats Error:", err);
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-zinc-500 min-h-screen">
                <RefreshCw className="w-10 h-10 animate-spin mb-4 opacity-50" />
                <p className="tracking-widest uppercase text-xs font-bold">Agregacja Danych Analitycznych...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="p-8 max-w-7xl mx-auto min-h-screen">
                <div className="p-10 text-center text-red-500 bg-red-500/10 rounded-3xl border border-red-500/20 flex flex-col items-center">
                    <AlertCircle className="w-12 h-12 mb-4 opacity-80" />
                    <h3 className="font-bold mb-2 text-xl tracking-widest uppercase">Błąd pobierania statystyk</h3>
                    <p className="text-sm font-mono mb-6">{errorMsg}</p>
                    <button onClick={fetchAllStats} className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-500 font-bold tracking-widest uppercase text-sm flex items-center gap-2 transition-colors">
                        <RefreshCw className="w-4 h-4" /> Ponów
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 min-h-screen text-white">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
                        Analytics <span className="text-boxing-green">Dashboard</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <span className="w-2 h-2 bg-boxing-green rounded-full animate-pulse"></span>
                        Status platformy live (Supabase)
                    </p>
                </div>
                <button
                    onClick={fetchAllStats}
                    className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all border border-white/5 group"
                    title="Odśwież dane"
                >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Users KPI */}
                <div className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-colors backdrop-blur-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                            <TrendingUp className="w-3 h-3" /> +{stats.recentUsers} (30d)
                        </span>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{stats.totalUsers}</div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Użytkownicy Total</div>
                </div>

                {/* News KPI */}
                <div className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 hover:border-red-500/30 transition-colors backdrop-blur-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                            <Newspaper className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">
                            {stats.breakingNews} Breaking
                        </span>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{stats.totalNews}</div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Wpisy Newsroom</div>
                </div>

                {/* Knowledge KPI */}
                <div className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 hover:border-boxing-green/30 transition-colors backdrop-blur-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-boxing-green/10 rounded-xl text-boxing-green">
                            <BookOpen className="w-6 h-6 text-black" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-boxing-green bg-boxing-green/10 px-2 py-1 rounded">
                            {stats.premiumKnowledge} Premium
                        </span>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{stats.totalKnowledge}</div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Baza Wiedzy</div>
                </div>

                {/* Media KPI */}
                <div className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors backdrop-blur-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded uppercase">
                            Bucket: media
                        </span>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{stats.totalMediaCount}</div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Pliki Multimedialne</div>
                </div>

            </div>

            {/* Growth Chart */}
            <div className="bg-zinc-900/40 p-6 md:p-8 rounded-3xl border border-white/5 backdrop-blur-sm min-h-[400px]">
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
                        <TrendingUp className="text-indigo-500" /> Wzrost Użytkowników
                    </h3>
                    <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mt-1">Ostatnie 30 dni (Aktywne Rejestracje)</p>
                </div>

                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#52525b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#52525b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ stroke: '#ffffff20', strokeWidth: 1, strokeDasharray: '3 3' }}
                                contentStyle={{
                                    backgroundColor: '#18181b',
                                    border: '1px solid #27272a',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                                }}
                                itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                                labelStyle={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '8px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="signups"
                                name="Nowe Konta"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorSignups)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;

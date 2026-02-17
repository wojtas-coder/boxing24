import React, { useEffect, useState } from 'react';
import { supabaseData as supabase } from '../../../lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Users, UserPlus, TrendingUp, Info } from 'lucide-react';

const AdminStats = () => {
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({ totalSignups: 0, activeUsers: 0, recentSignups: 0 });
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // 1. Fetch Users (last 30 days for graph)
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('created_at')
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

            if (usersError) throw usersError;

            // 2. Fetch Total Count
            const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

            // 3. Build real daily signup data (no mocks)
            const generateDailyData = () => {
                const days = [];
                for (let i = 29; i >= 0; i--) {
                    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                    const dateStr = date.toISOString().split('T')[0];

                    // Count real signups for this day
                    const signups = usersData?.filter(u => u.created_at?.startsWith(dateStr)).length || 0;

                    days.push({
                        name: date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
                        signups: signups
                    });
                }
                return days;
            };

            const formattedData = generateDailyData();
            setData(formattedData);

            const recentSignups = formattedData.reduce((acc, curr) => acc + curr.signups, 0);

            setSummary({
                totalSignups: totalUsers || 0,
                activeUsers: totalUsers || 0,
                recentSignups: recentSignups
            });

        } catch (err) {
            console.error("Stats Error:", err);
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Ładowanie danych analitycznych...</div>;
    if (errorMsg) return (
        <div className="p-10 text-center text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
            <h3 className="font-bold mb-2">Błąd pobierania statystyk</h3>
            <p className="text-sm font-mono">{errorMsg}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Spróbuj ponownie</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                Analityka <span className="text-red-600">Użytkowników</span>
            </h1>

            {/* Info banner */}
            <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-blue-400 text-sm">
                <Info className="w-5 h-5 flex-shrink-0" />
                <span>Dane oparte na rejestracji użytkowników z Supabase. Integracja z Google Analytics planowana w następnym etapie.</span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Users className="w-6 h-6" /></div>
                        <span className="text-xs font-bold text-zinc-500 uppercase">Ogółem</span>
                    </div>
                    <div className="text-4xl font-black text-white">{summary.totalSignups}</div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Zarejestrowani Użytkownicy</div>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><UserPlus className="w-6 h-6" /></div>
                        <span className="text-xs font-bold text-zinc-500 uppercase">Ostatnie 30 dni</span>
                    </div>
                    <div className="text-4xl font-black text-white">{summary.recentSignups}</div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Nowe Rejestracje</div>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500"><TrendingUp className="w-6 h-6" /></div>
                        <span className="text-xs font-bold text-zinc-500 uppercase">Trend</span>
                    </div>
                    <div className="text-4xl font-black text-white">
                        {summary.recentSignups > 0 ? '+' : ''}{summary.recentSignups}
                    </div>
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Wzrost (30 dni)</div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm min-h-[400px]">
                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Rejestracje Dziennie (30 dni)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                            cursor={{ fill: '#ffffff10' }}
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="signups" fill="#ef4444" radius={[4, 4, 0, 0]} name="Rejestracje" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AdminStats;

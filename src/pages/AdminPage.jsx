
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, Crown, Search, Save, AlertTriangle, CheckCircle, Edit, LayoutTemplate, MessageSquare, Dumbbell } from 'lucide-react';
import AdminMessages from '../components/admin/AdminMessages';
import AdminPlanEditor from '../components/admin/AdminPlanEditor';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- CONTENT EDITOR STATES ---
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'content'
    const [heroText, setHeroText] = useState('');
    const [vipText, setVipText] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        // This requires an RLS policy that allows admins to view profiles
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    const togglePremium = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'Premium' ? 'Free' : 'Premium';

        // Optimistic UI update
        setUsers(users.map(u => u.id === userId ? { ...u, membership_status: newStatus } : u));

        const { error } = await supabase
            .from('profiles')
            .update({ membership_status: newStatus })
            .eq('id', userId);

        if (error) {
            console.error('Failed to update status', error);
            fetchUsers(); // Revert on failure
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 pt-24 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex justify-between items-end border-b border-white/10 pb-8">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
                            Admin<span className="text-boxing-green">Panel</span>
                        </h1>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                            Zarządzanie Użytkownikami i Treścią
                        </p>
                    </div>

                    <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <Users className="w-4 h-4" /> Użytkownicy
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'messages' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <MessageSquare className="w-4 h-4" /> Wiadomości
                        </button>
                        <button
                            onClick={() => setActiveTab('plans')}
                            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'plans' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                            <Dumbbell className="w-4 h-4" /> Plany Treningowe
                        </button>
                    </div>
                </header>

                {/* --- USERS TAB --- */}
                {activeTab === 'users' && (
                    <div className="animate-in fade-in duration-500">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl">
                                <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Wszystkich</div>
                                <div className="text-3xl font-light">{users.length}</div>
                            </div>
                            <div className="bg-zinc-900/30 border border-boxing-green/20 p-6 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Crown className="w-12 h-12 text-boxing-green" /></div>
                                <div className="text-boxing-green text-[10px] font-bold uppercase tracking-widest mb-1">Premium</div>
                                <div className="text-3xl font-light text-white">{users.filter(u => u.membership_status === 'Premium' || u.membership_status === 'VIP').length}</div>
                            </div>
                            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl">
                                <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Online (24h)</div>
                                <div className="text-3xl font-light text-zinc-400">-</div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Szukaj użytkownika..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-all font-mono"
                            />
                        </div>

                        {/* Table */}
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        <th className="p-6">Użytkownik</th>
                                        <th className="p-6">Email</th>
                                        <th className="p-6">Status</th>
                                        <th className="p-6">Boxing Index</th>
                                        <th className="p-6 text-right">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan="5" className="p-12 text-center text-zinc-500">Ładowanie danych...</td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan="5" className="p-12 text-center text-zinc-500">Brak użytkowników.</td></tr>
                                    ) : (
                                        filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-6 font-medium text-white">{user.full_name || 'Bez nazwy'}</td>
                                                <td className="p-6 text-zinc-400 font-mono text-xs">{user.email}</td>
                                                <td className="p-6">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${user.membership_status === 'Premium'
                                                        ? 'bg-boxing-green/10 text-boxing-green border-boxing-green/20'
                                                        : user.membership_status === 'VIP'
                                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                                        }`}>
                                                        {user.membership_status || 'Free'}
                                                    </span>
                                                </td>
                                                <td className="p-6 font-mono text-zinc-400">
                                                    {user.boxing_index_results?.globalScore || '-'}
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button
                                                        onClick={() => togglePremium(user.id, user.membership_status)}
                                                        className="text-white hover:text-boxing-green transition-colors p-2 bg-zinc-900 rounded-lg border border-white/5 hover:border-boxing-green/50"
                                                        title={user.membership_status === 'Premium' ? 'Odbierz Premium' : 'Nadaj Premium'}
                                                    >
                                                        <Crown className={`w-4 h-4 ${user.membership_status === 'Premium' ? 'fill-boxing-green text-boxing-green' : 'opacity-50'}`} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- MESSAGES TAB --- */}
                {activeTab === 'messages' && (
                    <div className="animate-in fade-in duration-500">
                        <AdminMessages />
                    </div>
                )}

                {/* --- PLANS TAB --- */}
                {activeTab === 'plans' && (
                    <div className="animate-in fade-in duration-500">
                        <AdminPlanEditor />
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminPage;

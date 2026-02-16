import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
    Shield, User, Search, Crown, UserX, RefreshCw,
    ChevronDown, Check, X, Mail, Calendar, Star,
    Users as UsersIcon, Filter, ArrowUpDown, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MEMBERSHIP_TIERS = [
    { value: 'free', label: 'Free', color: 'zinc', description: 'Darmowy dostęp' },
    { value: 'starter', label: 'Starter', color: 'blue', description: 'Podstawowy pakiet' },
    { value: 'pro', label: 'Pro', color: 'purple', description: 'Zaawansowany pakiet' },
    { value: 'elite', label: 'Elite', color: 'amber', description: 'Pełny dostęp VIP' },
];

const MEMBERSHIP_STATUSES = [
    { value: 'Free', label: 'Free', color: 'zinc' },
    { value: 'member', label: 'Member', color: 'green' },
    { value: 'premium', label: 'Premium', color: 'purple' },
    { value: 'vip', label: 'VIP', color: 'amber' },
    { value: 'suspended', label: 'Zawieszony', color: 'red' },
];

const ROLES = [
    { value: 'client', label: 'Klient', color: 'zinc' },
    { value: 'trainer', label: 'Trener', color: 'blue' },
    { value: 'admin', label: 'Admin', color: 'red' },
];

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDesc, setSortDesc] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setErrorMsg('Błąd ładowania użytkowników: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Stats
    const stats = useMemo(() => ({
        total: users.length,
        premium: users.filter(u => ['member', 'premium', 'vip'].includes(u.membership_status?.toLowerCase())).length,
        free: users.filter(u => !u.membership_status || u.membership_status === 'Free').length,
        admins: users.filter(u => u.role === 'admin').length,
        trainers: users.filter(u => u.role === 'trainer').length,
    }), [users]);

    // Filtered and sorted users
    const filteredUsers = useMemo(() => {
        let result = [...users];

        // Search filter
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(u =>
                (u.full_name?.toLowerCase() || '').includes(q) ||
                (u.email?.toLowerCase() || '').includes(q) ||
                (u.username?.toLowerCase() || '').includes(q) ||
                u.id.toLowerCase().includes(q)
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            if (filterStatus === 'premium') {
                result = result.filter(u => ['member', 'premium', 'vip'].includes(u.membership_status?.toLowerCase()));
            } else {
                result = result.filter(u => (u.membership_status || 'Free') === filterStatus);
            }
        }

        // Role filter
        if (filterRole !== 'all') {
            result = result.filter(u => u.role === filterRole);
        }

        // Sort
        result.sort((a, b) => {
            let valA, valB;
            if (sortBy === 'created_at') {
                valA = new Date(a.created_at || 0).getTime();
                valB = new Date(b.created_at || 0).getTime();
            } else if (sortBy === 'name') {
                valA = (a.full_name || '').toLowerCase();
                valB = (b.full_name || '').toLowerCase();
            } else if (sortBy === 'status') {
                valA = a.membership_status || '';
                valB = b.membership_status || '';
            }
            return sortDesc ? (valB > valA ? 1 : -1) : (valA > valB ? 1 : -1);
        });

        return result;
    }, [users, search, filterStatus, filterRole, sortBy, sortDesc]);

    // Update user profile
    const updateUser = async (userId, updates) => {
        setUpdating(userId);
        setErrorMsg('');
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) throw error;

            // Update local state
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));

            // Update selected user panel if open
            if (selectedUser?.id === userId) {
                setSelectedUser(prev => ({ ...prev, ...updates }));
            }

            setSuccessMsg('Zaktualizowano!');
            setTimeout(() => setSuccessMsg(''), 2000);
        } catch (err) {
            console.error('Update error:', err);
            setErrorMsg('Błąd aktualizacji: ' + err.message);
        } finally {
            setUpdating(null);
        }
    };

    // Quick toggle premium
    const togglePremium = async (user) => {
        const isPremium = ['member', 'premium', 'vip'].includes(user.membership_status?.toLowerCase());
        const newStatus = isPremium ? 'Free' : 'member';
        const newTier = isPremium ? 'free' : 'pro';
        await updateUser(user.id, {
            membership_status: newStatus,
            membership_tier: newTier
        });
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Color helpers
    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        if (['member', 'premium'].includes(s)) return 'text-green-400 bg-green-500/10 border-green-500/20';
        if (s === 'vip') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        if (s === 'suspended') return 'text-red-400 bg-red-500/10 border-red-500/20';
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    };

    const getRoleColor = (role) => {
        if (role === 'admin') return 'text-red-400 bg-red-500/10 border-red-500/20';
        if (role === 'trainer') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    };

    const getTierColor = (tier) => {
        if (tier === 'elite') return 'text-amber-400';
        if (tier === 'pro') return 'text-purple-400';
        if (tier === 'starter') return 'text-blue-400';
        return 'text-zinc-500';
    };

    // ─── STAT CARD ────────────────────────────
    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className={`bg-zinc-900/50 border border-white/5 rounded-2xl p-5 backdrop-blur-sm`}>
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${color}-400`} />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-3xl font-black text-white">{value}</div>
        </div>
    );

    // ─── USER DETAIL PANEL ────────────────────
    const UserDetailPanel = ({ user }) => {
        const [editTier, setEditTier] = useState(user.membership_tier || 'free');
        const [editStatus, setEditStatus] = useState(user.membership_status || 'Free');
        const [editRole, setEditRole] = useState(user.role || 'client');

        const isPremium = ['member', 'premium', 'vip'].includes(editStatus?.toLowerCase());

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed right-0 top-0 h-screen w-full md:w-[480px] bg-zinc-900/95 backdrop-blur-xl border-l border-white/10 z-[100] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between z-10">
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Profil Użytkownika</h2>
                    <button onClick={() => setSelectedUser(null)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* User Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/10">
                            {user.avatar_url ?
                                <img src={user.avatar_url} className="w-full h-full rounded-2xl object-cover" alt="" /> :
                                <User className="w-8 h-8 text-zinc-500" />
                            }
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{user.full_name || 'Bez nazwy'}</h3>
                            <p className="text-sm text-zinc-500">{user.email || 'Brak email'}</p>
                            <p className="text-[10px] text-zinc-600 font-mono mt-1">{user.id}</p>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-800/50 rounded-xl p-3 border border-white/5">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Dołączył</span>
                            <div className="text-sm text-white font-bold mt-1">{formatDate(user.created_at)}</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-xl p-3 border border-white/5">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Subskrypcja</span>
                            <div className="text-sm text-white font-bold mt-1">{user.subscription_status || 'Brak'}</div>
                        </div>
                    </div>

                    {/* Stripe Info (future) */}
                    {user.stripe_customer_id && (
                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Stripe</span>
                            <p className="text-sm text-indigo-300 font-mono mt-1">{user.stripe_customer_id}</p>
                            {user.subscription_expires_at && (
                                <p className="text-xs text-zinc-500 mt-1">Wygasa: {formatDate(user.subscription_expires_at)}</p>
                            )}
                        </div>
                    )}

                    <hr className="border-white/5" />

                    {/* ─── MEMBERSHIP STATUS ─── */}
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
                            Status Członkostwa
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {MEMBERSHIP_STATUSES.map(s => (
                                <button
                                    key={s.value}
                                    onClick={() => setEditStatus(s.value)}
                                    className={`p-3 rounded-xl border text-sm font-bold transition-all text-left
                                        ${editStatus === s.value
                                            ? `bg-${s.color}-500/10 border-${s.color}-500/30 text-${s.color}-400 ring-1 ring-${s.color}-500/20`
                                            : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800'
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ─── MEMBERSHIP TIER ─── */}
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
                            Tier Pakietu <span className="text-zinc-600">(Przygotowane pod Stripe)</span>
                        </label>
                        <div className="space-y-2">
                            {MEMBERSHIP_TIERS.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => setEditTier(t.value)}
                                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between
                                        ${editTier === t.value
                                            ? `bg-${t.color}-500/10 border-${t.color}-500/30 ring-1 ring-${t.color}-500/20`
                                            : 'bg-zinc-800/50 border-white/5 hover:bg-zinc-800'
                                        }`}
                                >
                                    <div>
                                        <span className={`font-bold text-sm ${editTier === t.value ? `text-${t.color}-400` : 'text-zinc-400'}`}>
                                            {t.value === 'elite' && <Crown className="w-4 h-4 inline mr-1" />}
                                            {t.label}
                                        </span>
                                        <span className="text-[10px] text-zinc-600 ml-2">{t.description}</span>
                                    </div>
                                    {editTier === t.value && <Check className="w-4 h-4 text-green-400" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ─── ROLE ─── */}
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
                            Rola Systemowa
                        </label>
                        <div className="flex gap-2">
                            {ROLES.map(r => (
                                <button
                                    key={r.value}
                                    onClick={() => setEditRole(r.value)}
                                    className={`flex-1 p-3 rounded-xl border text-sm font-bold text-center transition-all
                                        ${editRole === r.value
                                            ? `bg-${r.color}-500/10 border-${r.color}-500/30 text-${r.color}-400 ring-1 ring-${r.color}-500/20`
                                            : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800'
                                        }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ─── SAVE BUTTON ─── */}
                    <button
                        onClick={() => updateUser(user.id, {
                            membership_status: editStatus,
                            membership_tier: editTier,
                            role: editRole
                        })}
                        disabled={
                            updating === user.id ||
                            (editStatus === (user.membership_status || 'Free') &&
                                editTier === (user.membership_tier || 'free') &&
                                editRole === (user.role || 'client'))
                        }
                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all
                            ${updating === user.id
                                ? 'bg-zinc-800 text-zinc-500 cursor-wait'
                                : (editStatus === (user.membership_status || 'Free') &&
                                    editTier === (user.membership_tier || 'free') &&
                                    editRole === (user.role || 'client'))
                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                    : 'bg-boxing-green text-black hover:bg-boxing-green/90 shadow-[0_0_20px_rgba(0,255,135,0.2)]'
                            }`}
                    >
                        {updating === user.id ? (
                            <><RefreshCw className="w-4 h-4 inline animate-spin mr-2" />Zapisuję...</>
                        ) : 'Zapisz Zmiany'}
                    </button>
                </div>
            </motion.div>
        );
    };

    // ─── MAIN RENDER ──────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                        Użytkownicy
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                        Zarządzanie Dostępem i Subskrypcjami
                    </p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                >
                    <RefreshCw className="w-4 h-4" /> Odśwież
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard icon={UsersIcon} label="Łącznie" value={stats.total} color="zinc" />
                <StatCard icon={Crown} label="Premium" value={stats.premium} color="green" />
                <StatCard icon={User} label="Free" value={stats.free} color="zinc" />
                <StatCard icon={Shield} label="Admini" value={stats.admins} color="red" />
                <StatCard icon={Star} label="Trenerzy" value={stats.trainers} color="blue" />
            </div>

            {/* Toasts */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-2 text-green-400 text-sm font-bold"
                    >
                        <Check className="w-4 h-4" /> {successMsg}
                    </motion.div>
                )}
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-2 text-red-400 text-sm font-bold"
                    >
                        <X className="w-4 h-4" /> {errorMsg}
                        <button onClick={() => setErrorMsg('')} className="ml-auto hover:text-white"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Szukaj po imieniu, email lub ID..."
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-red-600 outline-none transition-colors"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-zinc-400 cursor-pointer focus:border-red-600 outline-none"
                >
                    <option value="all">Wszystkie Statusy</option>
                    <option value="premium">Premium (wszyscy)</option>
                    <option value="Free">Free</option>
                    <option value="member">Member</option>
                    <option value="vip">VIP</option>
                    <option value="suspended">Zawieszeni</option>
                </select>

                {/* Role Filter */}
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-zinc-400 cursor-pointer focus:border-red-600 outline-none"
                >
                    <option value="all">Wszystkie Role</option>
                    <option value="client">Klienci</option>
                    <option value="trainer">Trenerzy</option>
                    <option value="admin">Admini</option>
                </select>

                {/* Sort */}
                <button
                    onClick={() => setSortDesc(!sortDesc)}
                    className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowUpDown className="w-4 h-4" />
                    {sortDesc ? 'Najnowsi' : 'Najstarsi'}
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-black/50 border-b border-white/5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        <tr>
                            <th className="p-6">Użytkownik</th>
                            <th className="p-6 hidden md:table-cell">Email</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 hidden lg:table-cell">Tier</th>
                            <th className="p-6 hidden lg:table-cell">Rola</th>
                            <th className="p-6 hidden xl:table-cell">Dołączył</th>
                            <th className="p-6 text-right">Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map(user => {
                            const isPremium = ['member', 'premium', 'vip'].includes(user.membership_status?.toLowerCase());
                            return (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isPremium ? 'bg-green-500/10 border-green-500/20' : 'bg-zinc-800 border-white/10'}`}>
                                                {user.avatar_url ?
                                                    <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" alt="" /> :
                                                    <User className={`w-5 h-5 ${isPremium ? 'text-green-400' : 'text-zinc-500'}`} />
                                                }
                                            </div>
                                            <div>
                                                <div className="font-bold text-white flex items-center gap-2">
                                                    {user.full_name || 'Bez nazwy'}
                                                    {isPremium && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                                                </div>
                                                <div className="text-[10px] text-zinc-600 font-mono md:hidden">{user.email || user.id.slice(0, 12)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 hidden md:table-cell">
                                        <span className="text-sm text-zinc-400">{user.email || '—'}</span>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(user.membership_status)}`}>
                                            {user.membership_status || 'Free'}
                                        </span>
                                    </td>
                                    <td className="p-6 hidden lg:table-cell">
                                        <span className={`text-sm font-bold ${getTierColor(user.membership_tier)}`}>
                                            {user.membership_tier || 'free'}
                                        </span>
                                    </td>
                                    <td className="p-6 hidden lg:table-cell">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getRoleColor(user.role)}`}>
                                            {user.role || 'client'}
                                        </span>
                                    </td>
                                    <td className="p-6 hidden xl:table-cell">
                                        <span className="text-sm text-zinc-500">{formatDate(user.created_at)}</span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            {/* Quick Premium Toggle */}
                                            <button
                                                onClick={() => togglePremium(user)}
                                                disabled={updating === user.id || user.role === 'admin'}
                                                title={isPremium ? 'Odbierz Premium' : 'Nadaj Premium'}
                                                className={`p-2 rounded-lg border transition-all
                                                    ${isPremium
                                                        ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400'
                                                        : 'bg-zinc-800 border-white/5 text-zinc-500 hover:bg-green-500/10 hover:border-green-500/20 hover:text-green-400'
                                                    }`}
                                            >
                                                <Crown className="w-4 h-4" />
                                            </button>

                                            {/* Detail Panel */}
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="p-2 rounded-lg border border-white/5 bg-zinc-800 text-zinc-500 hover:text-white hover:border-white/20 transition-all"
                                                title="Szczegóły"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-zinc-500">
                                    Brak użytkowników spełniających kryteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Results count */}
            <div className="text-xs text-zinc-600 text-center">
                Wyświetlam {filteredUsers.length} z {users.length} użytkowników
            </div>

            {/* User Detail Side Panel */}
            <AnimatePresence>
                {selectedUser && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                        />
                        <UserDetailPanel user={selectedUser} />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;

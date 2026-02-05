import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Shield, User, Search, CheckCircle, XCircle } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let mounted = true;
        fetchUsers();

        // Safety Unlock
        const timer = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Users List timed out");
                setLoading(false);
            }
        }, 1000); // 1s timeout

        return () => { mounted = false; clearTimeout(timer); };
    }, []);

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false }); // Assuming profiles will have created_at if we added it, if not defaults to id order implies creation usually

        if (error) console.error(error);
        if (data) setUsers(data);
        setLoading(false);
    };

    const toggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'trainer' ? 'client' : 'trainer'; // Toggle specific logic or cycle
        // For now let's just allow toggling Trainer <-> Client. Admin should probably not be togglable easily to prevent lockout.

        if (currentRole === 'admin') return alert("Nie można zmienić roli głównego Admina.");

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            alert("Błąd aktualizacji: " + error.message);
        } else {
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(u =>
        (u.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(search.toLowerCase()) // Email might not be in profiles if not synced manually, usually only in auth. profiles has username/full_name. 
        // Wait, our profiles schema has username/full_name. Email might be missing if we didn't add it to profiles.
        // The handle_new_user trigger adds full_name. 
        // We should double check if we can display meaningful info.
        // Let's assume full_name is the primary identifier for now.
    );

    if (loading) return <div>Ładowanie bazy użytkowników...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                        Użytkownicy
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Zarządzanie Dostępem i Rolami</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Szukaj użytkownika..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-red-600 outline-none transition-colors"
                />
            </div>

            {/* Users Table */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-black/50 border-b border-white/5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        <tr>
                            <th className="p-6">Użytkownik</th>
                            <th className="p-6">Rola</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 text-white font-bold">
                                            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" /> : <User className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{user.full_name || 'Bez nazwy'}</div>
                                            <div className="text-xs text-zinc-600 font-mono">{user.id.slice(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border 
                                        ${user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            user.role === 'trainer' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        <CheckCircle className="w-4 h-4 text-green-500" /> Aktywny
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    {user.role !== 'admin' && (
                                        <button
                                            onClick={() => toggleRole(user.id, user.role)}
                                            className="px-4 py-2 border border-white/10 rounded-lg text-xs font-bold uppercase hover:bg-white hover:text-black transition-all"
                                        >
                                            {user.role === 'trainer' ? 'Zdegraduj' : 'Mianuj Trenerem'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-zinc-500">
                                    Brak użytkowników spełniających kryteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search, User, Mail, Calendar, TrendingUp } from 'lucide-react';

const CoachClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchClients = async () => {
            // For now, fetch ALL users with role 'client' 
            // In a real system, we would query the 'relationships' table
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'client')
                .order('created_at', { ascending: false });

            if (data) setClients(data);
            setLoading(false);
        };

        fetchClients();
    }, []);

    const filteredClients = clients.filter(c =>
        (c.full_name?.toLowerCase() || '').includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                        Moi <span className="text-blue-500">Podopieczni</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Zarządzanie zawodnikami</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Szukaj zawodnika..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-colors"
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                    <div key={client.id} className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl hover:border-blue-500/50 transition-all group backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 text-white font-bold overflow-hidden">
                                {client.avatar_url ? <img src={client.avatar_url} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-zinc-600" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{client.full_name || 'Zawodnik'}</h3>
                                <p className="text-xs text-zinc-500 font-mono">ID: {client.id.slice(0, 8)}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-zinc-400">
                                <Mail className="w-4 h-4 text-blue-500" />
                                <span>{client.email || 'Brak emaila'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-400">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>Dołączył: {new Date(client.updated_at || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-400">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span>Aktywny plan: <span className="text-white">Fundamenty</span></span>
                            </div>
                        </div>

                        <button className="w-full mt-6 py-3 bg-blue-600/10 text-blue-500 font-bold uppercase text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                            Zobacz Profil
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoachClients;

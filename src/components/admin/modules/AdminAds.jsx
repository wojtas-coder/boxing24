import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Megaphone, ExternalLink, Trash2, Plus, Eye, MousePointer } from 'lucide-react';

const AdminAds = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newAd, setNewAd] = useState({ title: '', image_url: '', link_url: '', position: 'sidebar' });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchErr } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
            if (fetchErr) throw fetchErr;
            setAds(data || []);
        } catch (err) {
            console.error("Ads Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newAd.image_url) return alert("URL obrazka jest wymagany");

        const { error } = await supabase.from('ads').insert([{
            ...newAd,
            is_active: true
        }]);

        if (error) {
            alert("Błąd: " + error.message);
        } else {
            setNewAd({ title: '', image_url: '', link_url: '', position: 'sidebar' });
            setIsCreating(false);
            fetchAds();
        }
    };

    const toggleActive = async (id, currentStatus) => {
        await supabase.from('ads').update({ is_active: !currentStatus }).eq('id', id);
        fetchAds();
    };

    const deleteAd = async (id) => {
        if (!window.confirm("Usunąć reklamę?")) return;
        await supabase.from('ads').delete().eq('id', id);
        fetchAds();
    };

    if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Ładowanie reklam...</div>;
    if (error) return (
        <div className="p-10 text-center text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
            <h3 className="font-bold mb-2">Błąd pobierania reklam</h3>
            <p className="text-sm font-mono">{error}</p>
            <button onClick={() => { setError(null); fetchAds(); }} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Spróbuj ponownie</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                        Kampanie <span className="text-red-600">Reklamowe</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Zarządzanie Banerami</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 font-bold flex items-center gap-2 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
                >
                    <Plus className="w-4 h-4" /> Nowa Kampania
                </button>
            </div>

            {/* Creator */}
            {isCreating && (
                <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl space-y-4 shadow-xl">
                    <h3 className="text-white font-bold uppercase tracking-wider mb-4">Tworzenie Reklamy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={newAd.title} onChange={e => setNewAd({ ...newAd, title: e.target.value })} placeholder="Nazwa kampanii (wewnętrzna)" className="bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none" />
                        <select value={newAd.position} onChange={e => setNewAd({ ...newAd, position: e.target.value })} className="bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none">
                            <option value="sidebar">Sidebar (Boczny)</option>
                            <option value="header">Nagłówek (Banner)</option>
                            <option value="footer">Stopka</option>
                            <option value="popup">Pop-up</option>
                        </select>
                        <input value={newAd.image_url} onChange={e => setNewAd({ ...newAd, image_url: e.target.value })} placeholder="URL Obrazka (np. https://imgur.com/...)" className="bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none" />
                        <input value={newAd.link_url} onChange={e => setNewAd({ ...newAd, link_url: e.target.value })} placeholder="Link docelowy (np. /membership)" className="bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none" />
                    </div>
                    {newAd.image_url && <img src={newAd.image_url} alt="Preview" className="h-32 object-contain rounded border border-zinc-800 bg-black/50" />}
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-zinc-400 hover:text-white">Anuluj</button>
                        <button onClick={handleCreate} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 font-bold rounded">Uruchom</button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map(ad => (
                    <div key={ad.id} className={`bg-zinc-900/50 border ${ad.is_active ? 'border-green-500/30' : 'border-zinc-800'} rounded-2xl overflow-hidden group transition-all`}>
                        <div className="h-40 bg-black/50 relative">
                            <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-bold uppercase tracking-widest text-zinc-300">
                                {ad.position}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-white text-lg">{ad.title || 'Kampania bez nazwy'}</h3>
                                <div className={`w-3 h-3 rounded-full ${ad.is_active ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
                            </div>

                            <div className="flex gap-4 text-xs text-zinc-500 font-mono mb-6">
                                <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {ad.views_count}</div>
                                <div className="flex items-center gap-1"><MousePointer className="w-3 h-3" /> {ad.clicks_count}</div>
                            </div>

                            <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                <button onClick={() => toggleActive(ad.id, ad.is_active)} className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                                    {ad.is_active ? 'Zatrzymaj' : 'Wznów'}
                                </button>
                                <button onClick={() => deleteAd(ad.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminAds;

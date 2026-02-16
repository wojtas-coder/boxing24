import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Settings, Globe, AlertTriangle, Save, Megaphone } from 'lucide-react';

const AdminSEO = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const timeout = setTimeout(() => {
            if (mounted && loading) {
                setLoading(false);
                setError('Timeout: Nie udało się pobrać ustawień SEO.');
            }
        }, 5000);
        fetchSettings();
        return () => { mounted = false; clearTimeout(timeout); };
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchErr } = await supabase.from('app_settings').select('*');
            if (fetchErr) throw fetchErr;
            if (data) {
                const settingsMap = {};
                data.forEach(item => settingsMap[item.key] = item.value);
                setSettings(settingsMap);
            }
        } catch (err) {
            console.error("SEO Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveSettings = async () => {
        setSaving(true);
        const updates = Object.keys(settings).map(key => ({
            key,
            value: settings[key]
        }));

        const { error } = await supabase.from('app_settings').upsert(updates);
        if (error) alert("Błąd zapisu: " + error.message);
        setSaving(false);
    };

    if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Ładowanie konfiguracji...</div>;
    if (error) return (
        <div className="p-10 text-center text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
            <h3 className="font-bold mb-2">Błąd pobierania konfiguracji</h3>
            <p className="text-sm font-mono">{error}</p>
            <button onClick={() => { setError(null); fetchSettings(); }} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Spróbuj ponownie</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                        Konfiguracja <span className="text-red-600">SEO</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Ustawienia Globalne Strony</p>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="bg-zinc-100 hover:bg-white text-black px-8 py-3 font-bold flex items-center gap-2 rounded-xl transition-all disabled:opacity-50"
                >
                    <Save className="w-4 h-4" /> {saving ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                </button>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm space-y-6">
                    <div className="flex items-center gap-4 text-blue-500 mb-2">
                        <Globe className="w-6 h-6" />
                        <h3 className="font-bold uppercase tracking-wider text-white">Dane Podstawowe</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Tytuł Strony (Meta Title)</label>
                        <input
                            value={settings.site_title || ''}
                            onChange={e => handleUpdate('site_title', e.target.value)}
                            className="bg-black border border-zinc-700 p-4 text-white w-full rounded-xl focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Opis SEO (Meta Description)</label>
                        <textarea
                            value={settings.meta_description || ''}
                            onChange={e => handleUpdate('meta_description', e.target.value)}
                            className="bg-black border border-zinc-700 p-4 text-white w-full h-32 rounded-xl focus:border-blue-500 outline-none"
                            placeholder="Krótki opis widoczny w Google..."
                        />
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm space-y-6">
                    <div className="flex items-center gap-4 text-yellow-500 mb-2">
                        <Megaphone className="w-6 h-6" />
                        <h3 className="font-bold uppercase tracking-wider text-white">Komunikaty</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Top Banner (Pasek Ogłoszeń)</label>
                        <input
                            value={settings.top_banner_message || ''}
                            onChange={e => handleUpdate('top_banner_message', e.target.value)}
                            className="bg-black border border-zinc-700 p-4 text-white w-full rounded-xl focus:border-yellow-500 outline-none"
                        />
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-900/10 border border-red-500/20 p-8 rounded-2xl backdrop-blur-sm space-y-6">
                    <div className="flex items-center gap-4 text-red-500 mb-2">
                        <AlertTriangle className="w-6 h-6" />
                        <h3 className="font-bold uppercase tracking-wider text-white">Strefa Niebezpieczna</h3>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-900/20 rounded-xl border border-red-500/10">
                        <div>
                            <div className="font-bold text-white">Tryb Przerwy Technicznej</div>
                            <div className="text-xs text-red-400">Wyłącza dostęp do strony dla użytkowników.</div>
                        </div>
                        <button
                            onClick={() => handleUpdate('maintenance_mode', settings.maintenance_mode === 'true' ? 'false' : 'true')}
                            className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.maintenance_mode === 'true' ? 'bg-red-500' : 'bg-zinc-700'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transition-transform ${settings.maintenance_mode === 'true' ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSEO;

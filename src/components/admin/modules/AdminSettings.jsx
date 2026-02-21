import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
    Settings, Globe, AlertTriangle, Save,
    Building2, Palette, Share2, Link as LinkIcon, Server, Shield
} from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        company_name: '', company_nip: '', contact_email: '', contact_phone: '',
        address_street: '', address_postal: '', address_city: '', business_hours: '',
        seo_title_suffix: '', seo_default_description: '', seo_default_og_image: '',
        social_instagram: '', social_facebook: '', social_youtube: '', social_tiktok: '', social_x: '',
        brand_logo_url: '', brand_favicon_url: '', color_primary: '', color_secondary: '',
        analytics_ga4_id: '', meta_pixel_id: '',
        is_maintenance_mode: false, is_registration_open: true, is_booking_active: true
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('company');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchErr } = await supabase
                .from('site_settings')
                .select('*')
                .eq('id', 1)
                .single();

            if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr; // Ignore no rows error temporarily
            if (data) {
                setSettings(data);
            }
        } catch (err) {
            console.error("Settings Fetch Error:", err);
            setError(`Nie udało się pobrać ustawień: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveSettings = async () => {
        setSaving(true);
        setSuccess(false);
        setError(null);

        try {
            const payload = { ...settings, id: 1 };
            delete payload.created_at;
            delete payload.updated_at;

            const { error: upsertErr } = await supabase
                .from('site_settings')
                .upsert(payload, { onConflict: 'id' });

            if (upsertErr) throw upsertErr;
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Settings Save Error:", err);
            setError(`Błąd zapisu: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'company', label: 'Firma & Kontakt', icon: Building2 },
        { id: 'branding', label: 'Wygląd (Marka)', icon: Palette },
        { id: 'seo', label: 'SEO & Meta', icon: Globe },
        { id: 'social', label: 'Social Media', icon: Share2 },
        { id: 'integrations', label: 'Marketing (ID)', icon: LinkIcon },
        { id: 'system', label: 'System', icon: Server }
    ];

    if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse flex items-center justify-center gap-3"><Settings className="w-6 h-6 animate-spin" /> Ładowanie konfiguracji...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
            {/* HDR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                        Globalny <span className="text-red-600">Config</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Centrum sterowania parametrami systemu</p>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 font-bold flex items-center gap-2 rounded-xl transition-all disabled:opacity-50 uppercase tracking-widest text-sm shadow-lg shadow-red-500/20"
                >
                    <Save className="w-4 h-4" /> {saving ? 'Zapisywanie...' : 'Zapisz (Wszystko)'}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-bold">{error}</span>
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-900/20 border border-green-500/20 text-green-500 rounded-xl flex items-center gap-3">
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-bold">Ustawienia zostały pomyślnie zaktualizowane we wszystkich modułach.</span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* TABS SIDEBAR */}
                <div className="lg:w-64 flex-shrink-0 space-y-1">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all text-left ${isActive
                                        ? 'bg-zinc-800 text-white border-l-4 border-red-600'
                                        : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 border-l-4 border-transparent'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : ''}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* TAB CONTENT */}
                <div className="flex-1 min-w-0 bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-2xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

                    {/* COMPANY INFO */}
                    {activeTab === 'company' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 relative z-10">
                            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-4">
                                <Building2 className="text-blue-500" /> Dane Firmy i Kontakt
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Pełna Nazwa (np. Sp. z o.o.)</label>
                                    <input value={settings.company_name || ''} onChange={e => handleUpdate('company_name', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none" placeholder="Boxing24 Elite" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">NIP</label>
                                    <input value={settings.company_nip || ''} onChange={e => handleUpdate('company_nip', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none" placeholder="000-000-00-00" />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">E-mail GŁÓWNY</label>
                                        <input value={settings.contact_email || ''} onChange={e => handleUpdate('contact_email', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none" placeholder="kontakt@boxing24.pl" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Telefon</label>
                                        <input value={settings.contact_phone || ''} onChange={e => handleUpdate('contact_phone', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none" placeholder="+48 500 000 000" />
                                    </div>
                                </div>
                                <div className="md:col-span-2 pt-4 border-t border-white/5 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Ulica i lokal</label>
                                            <input value={settings.address_street || ''} onChange={e => handleUpdate('address_street', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Kod Pocztowy</label>
                                            <input value={settings.address_postal || ''} onChange={e => handleUpdate('address_postal', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Miasto</label>
                                            <input value={settings.address_city || ''} onChange={e => handleUpdate('address_city', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Godziny Otwarcia (Tabela / Opis)</label>
                                        <input value={settings.business_hours || ''} onChange={e => handleUpdate('business_hours', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none" placeholder="Codziennie 06:00 - 22:00" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* BRANDING */}
                    {activeTab === 'branding' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 relative z-10">
                            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-4">
                                <Palette className="text-pink-500" /> Wizualia Główne
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">URL Logotypu (Absolute)</label>
                                    <input value={settings.brand_logo_url || ''} onChange={e => handleUpdate('brand_logo_url', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none font-mono text-sm text-blue-400" placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">URL Favicon'y</label>
                                    <input value={settings.brand_favicon_url || ''} onChange={e => handleUpdate('brand_favicon_url', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none font-mono text-sm text-blue-400" />
                                </div>
                                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 flex justify-between">
                                            Kolor Główny {settings.color_primary && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: settings.color_primary }} />}
                                        </label>
                                        <input value={settings.color_primary || ''} onChange={e => handleUpdate('color_primary', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none font-mono text-sm uppercase" placeholder="#dc2626" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 flex justify-between">
                                            Kolor Poboczny {settings.color_secondary && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: settings.color_secondary }} />}
                                        </label>
                                        <input value={settings.color_secondary || ''} onChange={e => handleUpdate('color_secondary', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none font-mono text-sm uppercase" placeholder="#22c55e" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEO */}
                    {activeTab === 'seo' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 relative z-10">
                            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-4">
                                <Globe className="text-green-500" /> Domyślne Tagi SEO
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Sufiks Tytułu (Doklejany do każdej karty, np. "| Boxing24")</label>
                                    <input value={settings.seo_title_suffix || ''} onChange={e => handleUpdate('seo_title_suffix', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Domyślny Meta Description</label>
                                    <textarea rows={3} value={settings.seo_default_description || ''} onChange={e => handleUpdate('seo_default_description', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-red-500 transition-colors outline-none resize-none" placeholder="Pojawia się w Google gdy podstrona nie ma swojego..." />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Domyślny obrazek Open Graph URL (Social Media share)</label>
                                    <input value={settings.seo_default_og_image || ''} onChange={e => handleUpdate('seo_default_og_image', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-blue-400 font-mono text-sm focus:border-red-500 transition-colors outline-none" />
                                    <div className="mt-2 h-32 w-full bg-black border border-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                                        {settings.seo_default_og_image ? (
                                            <img src={settings.seo_default_og_image} alt="OG Preview" className="h-full object-cover opacity-80" />
                                        ) : (
                                            <span className="text-xs text-zinc-700 font-bold uppercase tracking-widest">Brak Podglądu</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SOCIAL MEDIA */}
                    {activeTab === 'social' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 relative z-10">
                            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-4">
                                <Share2 className="text-indigo-500" /> Linki Społecznościowe
                            </h2>
                            <div className="grid gap-4">
                                {['instagram', 'facebook', 'youtube', 'tiktok', 'x'].map(platform => (
                                    <div key={platform} className="flex relative items-center">
                                        <div className="w-32 flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{platform} URL</div>
                                        <input
                                            value={settings[`social_${platform}`] || ''}
                                            onChange={e => handleUpdate(`social_${platform}`, e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 transition-colors outline-none font-mono text-sm text-blue-400 placeholder:text-zinc-700"
                                            placeholder={`https://${platform}.com/...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* INTEGRATIONS */}
                    {activeTab === 'integrations' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 relative z-10">
                            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-4">
                                <LinkIcon className="text-orange-500" /> Kody Śledzące
                            </h2>
                            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-6 text-sm text-orange-200">
                                <strong>Ważne:</strong> Podaj tylko identyfikatory kodów (ID), skrypt sam wbuduje snippet na stronie. Zostaw puste aby wyłączyć.
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Google Analytics 4 (GA-4 ID)</label>
                                    <input value={settings.analytics_ga4_id || ''} onChange={e => handleUpdate('analytics_ga4_id', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 transition-colors outline-none font-mono" placeholder="G-XXXXXXXX" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Meta Pixel ID (Facebook)</label>
                                    <input value={settings.meta_pixel_id || ''} onChange={e => handleUpdate('meta_pixel_id', e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-orange-500 transition-colors outline-none font-mono" placeholder="1234567890" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SYSTEM TOGGLES */}
                    {activeTab === 'system' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 relative z-10">
                            <h2 className="text-xl font-bold text-red-500 mb-6 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-4">
                                <Server className="text-red-500" /> Sterowanie Systemem
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-5 bg-black border border-white/10 rounded-xl hover:border-red-500/30 transition-colors">
                                    <div>
                                        <div className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                                            Rejestracja Użytkowników
                                            <span className={`w-2 h-2 rounded-full ${settings.is_registration_open ? 'bg-green-500' : 'bg-red-500'}`} />
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1">Gdy wyłączone, odcina formularz signup. Logowanie bez zmian.</div>
                                    </div>
                                    <button
                                        onClick={() => handleUpdate('is_registration_open', !settings.is_registration_open)}
                                        className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.is_registration_open ? 'bg-green-600' : 'bg-zinc-800 border border-zinc-700'}`}
                                    >
                                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transition-transform ${settings.is_registration_open ? 'translate-x-6' : ''}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-5 bg-black border border-white/10 rounded-xl hover:border-red-500/30 transition-colors">
                                    <div>
                                        <div className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                                            Kalendarz Rezerwacji
                                            <span className={`w-2 h-2 rounded-full ${settings.is_booking_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1">Pozwala na chwilowe zamrożenie umawiania treningów (Kalendarz Pusty).</div>
                                    </div>
                                    <button
                                        onClick={() => handleUpdate('is_booking_active', !settings.is_booking_active)}
                                        className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.is_booking_active ? 'bg-green-600' : 'bg-zinc-800 border border-zinc-700'}`}
                                    >
                                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transition-transform ${settings.is_booking_active ? 'translate-x-6' : ''}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-5 bg-red-950/20 border border-red-500/20 rounded-xl mt-8">
                                    <div>
                                        <div className="font-bold text-red-500 uppercase tracking-wider text-sm flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" /> Tryb Przerwy (Maintenance)
                                        </div>
                                        <div className="text-xs text-red-400 mt-1">Zrzuca publiczną część serwisu do planszy "Wracamy wkrótce". (Tylko na czas dużej awarii)</div>
                                    </div>
                                    <button
                                        onClick={() => handleUpdate('is_maintenance_mode', !settings.is_maintenance_mode)}
                                        className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.is_maintenance_mode ? 'bg-red-600' : 'bg-red-950/50 border border-red-900'}`}
                                    >
                                        <div className={`bg-white w-6 h-6 rounded-full shadow-md transition-transform ${settings.is_maintenance_mode ? 'translate-x-6' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;

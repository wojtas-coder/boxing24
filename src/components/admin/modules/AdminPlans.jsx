import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
    Crown, Plus, Trash2, Edit2, Save, X, AlertTriangle,
    RefreshCw, Check, MoveUp, MoveDown, LayoutTemplate,
    Zap, Tag, DollarSign, Activity, Eye, EyeOff
} from 'lucide-react';

const AdminPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        tier: '',
        features: [],
        recommended: false,
        button_text: '',
        action_type: 'link',
        action_url: '',
        is_active: true,
        order_index: 0
    });
    const [tempFeature, setTempFeature] = useState('');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('memberships')
                .select('*')
                .order('order_index', { ascending: true })
                .order('created_at', { ascending: true });

            if (error) throw error;
            setPlans(data || []);
        } catch (err) {
            console.error("Błąd pobierania pakietów:", err);
            setError("Nie udało się pobrać cennika. Upewnij się, że tabele w bazie są utworzone.");
        } finally {
            setLoading(false);
        }
    };

    const handleSeedDefaults = async () => {
        setSaving(true);
        setError(null);
        try {
            const defaultPlans = [
                {
                    title: 'Digital Pass',
                    price: '19.99',
                    tier: 'basic',
                    features: ["Pełen dostęp do Boksopedii (Artykuły)", "Nielimitowany dostęp do bazy wiedzy", "Dostęp do Społeczności Discord", "Newsletter Taktyczny"],
                    recommended: false,
                    button_text: 'Wybierz Pakiet',
                    action_type: 'alert',
                    action_url: 'Przekierowanie do płatności subskrypcyjnej...',
                    order_index: 1,
                    is_active: true
                },
                {
                    title: 'Pro Fighter',
                    price: '249',
                    tier: 'pro',
                    features: ["Wszystko z pakietu Digital Pass", "Dostęp do Panelu Zawodnika (Member Zone)", "Plan Treningowy (Boks / Motoryka / Hybryda)", "Dziennik Treningowy Online", "1x Konsultacja Wideo (Analiza Techniki) / mc"],
                    recommended: true,
                    button_text: 'Rozpocznij Współpracę',
                    action_type: 'link',
                    action_url: '/members',
                    order_index: 2,
                    is_active: true
                },
                {
                    title: 'Elite Mentorship',
                    price: '1499',
                    tier: 'elite',
                    features: ["Pełna opieka trenerska 24/7", "Indywidualny makrocykl treningowy", "Cotygodniowa Analiza Wideo Twoich walk/sparingów", "Konsultacje dietetyczne i suplementacyjne", "Ebooki i Poradniki Premium w cenie", "Priorytetowy kontakt na WhatsApp", "Spotkania na żywo (opcjonalnie)"],
                    recommended: false,
                    button_text: 'Aplikuj o Miejsce',
                    action_type: 'mailto',
                    action_url: 'High Ticket Mentorship',
                    order_index: 3,
                    is_active: true
                }
            ];

            const { error } = await supabase.from('memberships').insert(defaultPlans);
            if (error) throw error;

            setSuccess("Poprawnie wygenerowano 3 domyślne pakiety Boxing24!");
            fetchPlans();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Błąd podczas automatycznego generowania:", err);
            setError(`Błąd generowania pakietów: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenEditor = (plan = null) => {
        if (plan) {
            setCurrentPlan(plan);
            setFormData({
                title: plan.title || '',
                price: plan.price || '',
                tier: plan.tier || '',
                features: plan.features || [],
                recommended: plan.recommended || false,
                button_text: plan.button_text || '',
                action_type: plan.action_type || 'link',
                action_url: plan.action_url || '',
                is_active: plan.is_active ?? true,
                order_index: plan.order_index || 0
            });
        } else {
            setCurrentPlan(null);
            setFormData({
                title: '',
                price: '',
                tier: '',
                features: [],
                recommended: false,
                button_text: 'Rozpocznij',
                action_type: 'link',
                action_url: '',
                is_active: true,
                order_index: plans.length + 1
            });
        }
        setIsEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setCurrentPlan(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddFeature = () => {
        if (tempFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, tempFeature.trim()]
            }));
            setTempFeature('');
        }
    };

    const handleRemoveFeature = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== indexToRemove)
        }));
    };

    const handleMoveOrder = async (id, direction) => {
        const index = plans.findIndex(p => p.id === id);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === plans.length - 1)
        ) return;

        const newPlans = [...plans];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap locally
        const tempOrder = newPlans[index].order_index;
        newPlans[index].order_index = newPlans[swapIndex].order_index;
        newPlans[swapIndex].order_index = tempOrder;

        const temp = newPlans[index];
        newPlans[index] = newPlans[swapIndex];
        newPlans[swapIndex] = temp;

        setPlans(newPlans);

        // Save order to DB
        try {
            await supabase.from('memberships').update({ order_index: newPlans[index].order_index }).eq('id', newPlans[index].id);
            await supabase.from('memberships').update({ order_index: newPlans[swapIndex].order_index }).eq('id', newPlans[swapIndex].id);
            setSuccess("Zaktualizowano kolejność wyświeltania.");
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            console.error(err);
            fetchPlans(); // revert on fail
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (currentPlan) {
                // Update
                const { error } = await supabase
                    .from('memberships')
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentPlan.id);
                if (error) throw error;
                setSuccess("Architektura pakietu została pomyślnie nadpisana.");
            } else {
                // Insert
                const { error } = await supabase
                    .from('memberships')
                    .insert([formData]);
                if (error) throw error;
                setSuccess("Nowy pakiet biznesowy został osadzony w systemie.");
            }

            fetchPlans();
            handleCloseEditor();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Błąd zapisu pakietu:", err);
            setError(`Krytyczny błąd podczas alokacji: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("UWAGA: Usunięcie pakietu wymaże go bezpowrotnie ze strony ofertowej. Jesteś pewien operacji?")) return;

        try {
            const { error } = await supabase
                .from('memberships')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSuccess("Jednostka biznesowa została odeskortowana z instancji.");
            fetchPlans();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Błąd usuwania:", err);
            alert(`Błąd: ${err.message}`);
        }
    };

    if (loading && plans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Crown className="w-12 h-12 text-boxing-green animate-pulse" />
                <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Inicjalizacja modułu wyceny...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header / Dashboard Metrics */}
            <div className="bg-gradient-to-br from-zinc-900 to-black rounded-3xl p-8 border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-boxing-green/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-boxing-green/10 border border-boxing-green/20 rounded-full text-boxing-green text-[10px] font-black uppercase tracking-widest mb-4">
                            <Activity className="w-3 h-3" /> Aktywny Moduł Sprzedaży
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                            <Crown className="text-boxing-green w-10 h-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                            Zarządzanie <span className="text-boxing-green">Ofertą</span>
                        </h1>
                        <p className="text-zinc-400 font-light text-sm mt-3 max-w-xl leading-relaxed">
                            Panel kontrolny struktury cenowej Boxing24. Konstruuj i modeluj ścieżki konwersji użykowników od darmowych lejków aż po produkty High-Ticket Elite Mentorship.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleOpenEditor()}
                            className="bg-boxing-green text-black hover:bg-white px-8 py-4 font-black flex items-center gap-3 rounded-2xl transition-all duration-300 uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1"
                        >
                            <Plus className="w-5 h-5" /> Nowy Koszyk
                        </button>
                    </div>
                </div>

                {/* Micro Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5 relative z-10">
                    <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Aktywne Pakiety</p>
                        <p className="text-2xl font-black text-white">{plans.filter(p => p.is_active).length} <span className="text-sm font-light text-zinc-600">/ {plans.length}</span></p>
                    </div>
                    <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Model High-Ticket</p>
                        <p className="text-2xl font-black text-boxing-green">{plans.find(p => p.price > 1000) ? 'TAK' : 'BRAK'}</p>
                    </div>
                    <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Promowany Koszyk</p>
                        <p className="text-lg font-black text-white truncate">{plans.find(p => p.recommended)?.title || 'Brak'}</p>
                    </div>
                    <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Łącznie Funkcjonalności</p>
                        <p className="text-2xl font-black text-white">{plans.reduce((acc, plan) => acc + (plan.features?.length || 0), 0)}</p>
                    </div>
                </div>
            </div>

            {/* Notification Area */}
            {error && !isEditorOpen && (
                <div className="p-4 bg-red-900/30 border-l-4 border-red-500 text-red-500 rounded-lg flex items-center gap-3 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
            )}
            {success && !isEditorOpen && (
                <div className="p-4 bg-boxing-green/10 border-l-4 border-boxing-green text-boxing-green rounded-lg flex items-center gap-3 font-bold text-sm">
                    <Check className="w-5 h-5 flex-shrink-0" /> {success}
                </div>
            )}

            {/* Empty State / Initialization */}
            {plans.length === 0 && !loading && !error && (
                <div className="py-24 text-center border border-white/5 bg-[#0a0a0a] rounded-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-boxing-green/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-boxing-green/10 transition-colors duration-700"></div>

                    <LayoutTemplate className="w-20 h-20 text-zinc-800 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:text-zinc-700" />
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Pusty Magazyn Ofertowy</h3>
                    <p className="text-zinc-500 text-base max-w-lg mx-auto leading-relaxed mb-10">
                        Nie wykryto żadnych pakietów cenowych zapisanych w bazie danych. Platforma sprzedażowa jest obecnie uśpiona. Możesz zbudować architekturę od zera budując własne koszyki, lub osadzić 3 standardowe zarysy.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <button
                            onClick={handleSeedDefaults}
                            disabled={saving}
                            className="bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-colors disabled:opacity-50"
                        >
                            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                            Inicjalizuj 3 Domyślne Pakiety (Auto)
                        </button>
                    </div>
                </div>
            )}

            {/* Plans Grid layout */}
            {plans.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div key={plan.id} className={`group bg-[#0a0a0a] border ${plan.recommended ? 'border-boxing-green/40 shadow-[0_0_40px_rgba(34,197,94,0.08)]' : plan.is_active ? 'border-white/10 hover:border-white/20' : 'border-red-900/30 opacity-60'} rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 flex flex-col relative overflow-hidden`}>

                            {/* Decorative Background for High Ticket */}
                            {plan.price > 1000 && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] pointer-events-none"></div>}

                            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className={`text-xl font-black uppercase tracking-wider ${plan.recommended ? 'text-boxing-green' : 'text-white'}`}>{plan.title}</h3>
                                        {!plan.is_active && <EyeOff className="w-4 h-4 text-red-500" title="Ukryty na WWW" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-3 h-3 text-zinc-600" />
                                        <p className="text-zinc-500 text-[10px] font-mono uppercase">Tier ID: {plan.tier}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-white">{plan.price}</span>
                                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">PLN</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 mb-8">
                                <ul className="space-y-3">
                                    {plan.features.slice(0, 5).map((feat, i) => (
                                        <li key={i} className="text-zinc-400 text-sm flex items-start gap-3">
                                            <div className="mt-1 rounded-full p-0.5 bg-zinc-900 text-boxing-green flex-shrink-0">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className="leading-snug">{feat}</span>
                                        </li>
                                    ))}
                                    {plan.features.length > 5 && (
                                        <li className="text-zinc-600 text-xs font-mono font-bold mt-4 pt-4 border-t border-white/5 uppercase tracking-widest">
                                            + {plan.features.length - 5} rozszerzonych korzyści
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="bg-black/50 p-4 rounded-xl border border-white/5 mb-6 flex items-center justify-between">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-zinc-600 tracking-widest mb-1">Przycisk (CTA)</span>
                                    <span className="text-xs font-bold text-white px-2 py-1 bg-white/10 rounded">{plan.button_text}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] uppercase font-bold text-zinc-600 tracking-widest mb-1">Akcja</span>
                                    <span className="text-xs font-mono text-zinc-400 line-clamp-1 max-w-[120px]" title={plan.action_url}>{plan.action_type === 'mailto' ? 'Mail' : plan.action_type === 'link' ? 'URL' : 'Alert'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-auto pt-6 border-t border-white/5">
                                <div className="flex bg-black rounded-lg border border-white/5 overflow-hidden">
                                    <button onClick={() => handleMoveOrder(plan.id, 'up')} disabled={index === 0} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 disabled:opacity-20 text-zinc-400 hover:text-white transition-colors"><MoveUp className="w-4 h-4" /></button>
                                    <div className="w-px bg-white/5"></div>
                                    <button onClick={() => handleMoveOrder(plan.id, 'down')} disabled={index === plans.length - 1} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 disabled:opacity-20 text-zinc-400 hover:text-white transition-colors"><MoveDown className="w-4 h-4" /></button>
                                </div>

                                <div className="flex-1 flex justify-end gap-2">
                                    <button onClick={() => handleOpenEditor(plan)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors border border-white/5">
                                        <Edit2 className="w-4 h-4" /> Edycja
                                    </button>
                                    <button onClick={() => handleDelete(plan.id)} className="w-12 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20" title="Trwale usuń koszyk">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EDITOR MODAL - Pro Experience */}
            {isEditorOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] relative flex flex-col">

                        {/* Header Fixed */}
                        <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-20 border-b border-white/5 p-6 md:px-10 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                                    <Crown className="text-boxing-green w-6 h-6" />
                                    {currentPlan ? 'Konfigurator Koszyka' : 'Kreator Biznesowy'}
                                </h2>
                                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mt-1">{currentPlan ? `Edytujesz parametry: ${currentPlan.title}` : 'Opracuj nowy produkt dla swojej firmy'}</p>
                            </div>
                            <button onClick={handleCloseEditor} className="p-3 bg-white/5 hover:bg-red-500 hover:text-white text-zinc-400 rounded-xl transition-all"><X className="w-6 h-6" /></button>
                        </div>

                        {/* Body Scrollable */}
                        <div className="p-6 md:p-10 space-y-10">

                            {/* Section: Core Info */}
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-boxing-green">1</div>
                                    Parametry Główne
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 p-6 md:p-8 rounded-2xl border border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tytuł Ofertowy</label>
                                        <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold text-lg focus:border-boxing-green focus:ring-1 focus:ring-boxing-green outline-none transition-all" placeholder="Np. Pro Fighter" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Wartość Inwestycji (Widoczna Kwota)</label>
                                        <div className="relative">
                                            <input name="price" value={formData.price} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl p-4 pl-12 text-white font-black text-xl focus:border-boxing-green focus:ring-1 focus:ring-boxing-green outline-none transition-all" placeholder="249" />
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Identyfikator Techniczny (np. dla API)</label>
                                        <input name="tier" value={formData.tier} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-boxing-green outline-none transition-all" placeholder="basic, pro, pro-yearly..." disabled={!!currentPlan} title={currentPlan ? "Identfykator jest stały po utworzeniu" : ""} />
                                    </div>

                                    <div className="flex flex-col gap-4 mt-6">
                                        <label className="relative flex items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-xl cursor-pointer hover:border-white/20 transition-all group">
                                            <div>
                                                <span className={`block text-xs font-black uppercase tracking-widest ${formData.recommended ? 'text-boxing-green' : 'text-zinc-400'}`}>Bestseller / Highlight</span>
                                                <span className="text-[10px] text-zinc-600 font-bold uppercase mt-1">Koszyk zostanie powiększony i oświetlony kolorem marki.</span>
                                            </div>
                                            <input type="checkbox" name="recommended" checked={formData.recommended} onChange={handleChange} className="sr-only peer" />
                                            <div className="w-12 h-6 bg-black rounded-full peer peer-checked:bg-boxing-green transition-all relative">
                                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${formData.recommended ? 'translate-x-6' : ''}`}></div>
                                            </div>
                                        </label>

                                        <label className="relative flex items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-xl cursor-pointer hover:border-white/20 transition-all group">
                                            <div>
                                                <span className={`block text-xs font-black uppercase tracking-widest ${formData.is_active ? 'text-white' : 'text-zinc-600'}`}>Status: Publikacja na WWW</span>
                                                <span className="text-[10px] text-zinc-600 font-bold uppercase mt-1">Odznacz aby ukryć tymczasowo ten pakiet dla klientów.</span>
                                            </div>
                                            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="sr-only peer" />
                                            <div className="w-12 h-6 bg-black rounded-full peer peer-checked:bg-white transition-all relative">
                                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-zinc-500 transition-all ${formData.is_active ? 'translate-x-6 bg-black' : ''}`}></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Action CTA */}
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-boxing-green">2</div>
                                    Konfiguracja Call-To-Action (Przycisku)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/40 p-6 md:p-8 rounded-2xl border border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tekst na przycisku</label>
                                        <input name="button_text" value={formData.button_text} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-boxing-green outline-none transition-all font-bold" placeholder="Kliknij tutaj" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Typ zachowania</label>
                                        <select name="action_type" value={formData.action_type} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white focus:border-boxing-green outline-none transition-all cursor-pointer font-bold appearance-none">
                                            <option value="link">Nawigacja: Otwórz Link URL / Podstronę</option>
                                            <option value="mailto">Koperta: Otwórz Klienta E-mail</option>
                                            <option value="alert">Test: Pokaż Komunikat Alert</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Destynacja (URL / Treść)</label>
                                        <input name="action_url" value={formData.action_url} onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-boxing-green outline-none transition-all focus:ring-1 focus:ring-boxing-green" placeholder="np. /members lub https://..." />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Features */}
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3 justify-between">
                                    <span className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-boxing-green">3</div>
                                        Architektura Wartości (Features)
                                    </span>
                                    <span className="text-xs text-zinc-500 font-mono bg-zinc-900 px-3 py-1 rounded-full">{formData.features.length} elementów korzyści</span>
                                </h3>
                                <div className="bg-black/40 p-6 md:p-8 rounded-2xl border border-white/5 space-y-8">

                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-boxing-green">
                                                <Check className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                value={tempFeature}
                                                onChange={(e) => setTempFeature(e.target.value)}
                                                onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                                                className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-boxing-green focus:ring-1 focus:ring-boxing-green outline-none transition-all"
                                                placeholder="Napisz korzyść, np. Stały dostęp do ekskluzywnych materiałów wideo..."
                                            />
                                        </div>
                                        <button type="button" onClick={handleAddFeature} className="bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-transform hover:scale-105 active:scale-95 flex-shrink-0">
                                            Załącz Wartość
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.features.length === 0 && (
                                            <div className="text-center py-12 bg-zinc-900/50 border border-white/5 border-dashed rounded-xl">
                                                <AlertTriangle className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                                                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Koszyk obietnic jest pusty</p>
                                            </div>
                                        )}
                                        {formData.features.map((feature, index) => (
                                            <div key={index} className="flex justify-between items-center bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 hover:border-white/10 p-4 rounded-xl group transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-6 h-6 rounded bg-boxing-green/10 flex items-center justify-center text-boxing-green text-xs font-mono font-bold flex-shrink-0 border border-boxing-green/20">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-zinc-200 text-sm md:text-base">{feature}</span>
                                                </div>
                                                <button type="button" onClick={() => handleRemoveFeature(index)} className="w-10 h-10 flex items-center justify-center bg-red-500/5 hover:bg-red-500/20 text-zinc-600 hover:text-red-500 rounded-lg transition-colors flex-shrink-0 border border-transparent hover:border-red-500/20 ml-4">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>

                        </div>

                        {/* Footer Fixed */}
                        <div className="sticky bottom-0 bg-[#0a0a0a]/95 backdrop-blur z-20 p-6 md:px-10 border-t border-white/5 flex flex-col-reverse md:flex-row justify-end gap-4 rounded-b-3xl">
                            <button onClick={handleCloseEditor} className="px-8 py-4 uppercase tracking-widest text-xs font-bold text-zinc-400 hover:text-white bg-transparent hover:bg-white/5 rounded-xl transition-colors">
                                Zaniechaj Zmian
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full md:w-auto px-12 py-4 bg-boxing-green text-black hover:bg-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)]"
                            >
                                {saving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                                Publikuj i Zapisz Strukturę
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPlans;

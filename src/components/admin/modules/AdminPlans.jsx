import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Crown, Plus, Trash2, Edit2, Save, X, AlertTriangle, RefreshCw, Check, MoveUp, MoveDown } from 'lucide-react';

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
            setError("Nie udało się pobrać cennika. Upewnij się, że tabela w bazie danych została utworzona.");
        } finally {
            setLoading(false);
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
                button_text: 'Wybierz Pakiet',
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
            setSuccess("Zaktualizowano kolejność widzenia");
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
                setSuccess("Pakiet zaktualizowany pomyślnie.");
            } else {
                // Insert
                const { error } = await supabase
                    .from('memberships')
                    .insert([formData]);
                if (error) throw error;
                setSuccess("Dodano nowy pakiet.");
            }

            fetchPlans();
            handleCloseEditor();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Błąd zapisu pakietu:", err);
            setError(`Błąd podczas zapisywania: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Na pewno usunąć ten pakiet? Przestanie być dostępny na stronie Dołącz Do Nas.")) return;

        try {
            const { error } = await supabase
                .from('memberships')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSuccess("Pakiet został usunięty.");
            fetchPlans();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Błąd usuwania:", err);
            alert(`Nie udało się usunąć: ${err.message}`);
        }
    };

    if (loading && plans.length === 0) return <div className="text-zinc-500 animate-pulse p-8">Ładowanie cennika...</div>;

    return (
        <div className="space-y-8 max-w-6xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Crown className="text-boxing-green w-8 h-8" /> Pakiety <span className="text-boxing-green">Cenowe</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">Zarządzanie ofertą MembershipPage i usługami</p>
                </div>
                <button
                    onClick={() => handleOpenEditor()}
                    className="bg-boxing-green text-black hover:bg-white px-6 py-3 font-bold flex items-center gap-2 rounded-xl transition-all uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                >
                    <Plus className="w-5 h-5" /> Dodaj Pakiet
                </button>
            </div>

            {error && !isEditorOpen && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
            )}

            {success && !isEditorOpen && (
                <div className="p-4 bg-green-900/20 border border-green-500/20 text-green-500 rounded-xl flex items-center gap-3 font-bold text-sm shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                    <Check className="w-5 h-5 flex-shrink-0" /> {success}
                </div>
            )}

            {/* Plans List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                    <div key={plan.id} className={`bg-zinc-900/40 border ${plan.recommended ? 'border-boxing-green/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : plan.is_active ? 'border-white/10' : 'border-zinc-800 opacity-50'} rounded-2xl p-6 transition-all flex flex-col relative`}>

                        {plan.recommended && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-boxing-green text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                Promowany
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider">{plan.title}</h3>
                                <p className="text-zinc-500 text-[10px] font-mono mt-1">Tier: {plan.tier}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-white">{plan.price}</span>
                                <span className="text-zinc-500 text-xs ml-1 font-bold">PLN</span>
                            </div>
                        </div>

                        <div className="flex-1">
                            <ul className="space-y-2 mb-6 border-t border-white/5 pt-4">
                                {plan.features.slice(0, 4).map((feat, i) => (
                                    <li key={i} className="text-zinc-400 text-xs flex items-start gap-2">
                                        <Check className="w-3 h-3 text-boxing-green mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-1">{feat}</span>
                                    </li>
                                ))}
                                {plan.features.length > 4 && (
                                    <li className="text-zinc-600 text-xs font-mono">+{plan.features.length - 4} więcej...</li>
                                )}
                            </ul>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-auto border-t border-white/5 pt-4">
                            <button onClick={() => handleMoveOrder(plan.id, 'up')} disabled={index === 0} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-white transition-colors"><MoveUp className="w-4 h-4" /></button>
                            <button onClick={() => handleMoveOrder(plan.id, 'down')} disabled={index === plans.length - 1} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-white transition-colors"><MoveDown className="w-4 h-4" /></button>

                            <div className="flex-1 flex justify-end gap-2">
                                <button onClick={() => handleOpenEditor(plan)} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded flex items-center gap-2 text-xs font-bold uppercase transition-colors">
                                    <Edit2 className="w-3 h-3" /> Edytuj
                                </button>
                                <button onClick={() => handleDelete(plan.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors" title="Usuń pakiet">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {plans.length === 0 && !loading && !error && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
                        <Crown className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-widest">Brak pakietów</h3>
                        <p className="text-zinc-600 text-sm mt-2">Dodaj pierwszy koszyk usług do bazy.</p>
                    </div>
                )}
            </div>

            {/* EDITOR MODAL */}
            {isEditorOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative">

                        <div className="sticky top-0 bg-zinc-900/90 backdrop-blur z-10 border-b border-white/5 p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                                <Crown className="text-boxing-green w-5 h-5" />
                                {currentPlan ? `Edytuj: ${currentPlan.title}` : 'Nowy Pakiet'}
                            </h2>
                            <button onClick={handleCloseEditor} className="p-2 text-zinc-500 hover:text-white bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tytuł Pakietu</label>
                                    <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-boxing-green outline-none transition-colors" placeholder="np. Pro Fighter" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Cena (kwota)</label>
                                    <input name="price" value={formData.price} onChange={handleChange} className="w-full bg-black border border-white/10 rounded p-3 text-white font-mono text-sm focus:border-boxing-green outline-none transition-colors" placeholder="np. 249" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Identyfikator (Tier)</label>
                                    <input name="tier" value={formData.tier} onChange={handleChange} className="w-full bg-black border border-white/10 rounded p-3 text-white font-mono text-sm focus:border-boxing-green outline-none transition-colors" placeholder="np. pro" disabled={!!currentPlan} title={currentPlan ? "Identfykator techniczny jest niezmienny" : ""} />
                                    <p className="text-[10px] text-zinc-600">Unikalne techniczne słowo np. basic, pro, elite.</p>
                                </div>
                                <div className="space-y-2 flex items-center gap-6 mt-6">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                                        <span className={`ml-3 text-[10px] font-bold uppercase tracking-widest ${formData.is_active ? 'text-white' : 'text-zinc-500'}`}>Aktywny (Widoczny)</span>
                                    </label>

                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="recommended" checked={formData.recommended} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-boxing-green"></div>
                                        <span className={`ml-3 text-[10px] font-bold uppercase tracking-widest ${formData.recommended ? 'text-boxing-green' : 'text-zinc-500'}`}>Promowany (Highlight)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Button Action Settings */}
                            <div className="bg-black/50 border border-white/5 rounded-xl p-6">
                                <h3 className="text-xs font-bold uppercase text-white tracking-widest mb-4">Ustawienia Przycisku</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tekst Przycisku</label>
                                        <input name="button_text" value={formData.button_text} onChange={handleChange} className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-boxing-green outline-none transition-colors" placeholder="Wybierz Pakiet" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Akcja po kliknięciu</label>
                                        <select name="action_type" value={formData.action_type} onChange={handleChange} className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-boxing-green outline-none transition-colors cursor-pointer appearance-none">
                                            <option value="link">Zwykły Link (Przekierowanie)</option>
                                            <option value="mailto">Wyślij Maila</option>
                                            <option value="alert">Alert (Tymczasowe Info)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Link URL / Treść maila</label>
                                        <input name="action_url" value={formData.action_url} onChange={handleChange} className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-boxing-green outline-none transition-colors" placeholder="/members lub email@..." />
                                    </div>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex justify-between">
                                    <span>Lista Funkcji (Zalety Pakietu)</span>
                                    <span>{formData.features.length} elementów</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tempFeature}
                                        onChange={(e) => setTempFeature(e.target.value)}
                                        onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                                        className="flex-1 bg-black border border-white/10 rounded p-3 text-white text-sm focus:border-boxing-green outline-none transition-colors"
                                        placeholder="np. Dostęp do społeczności Discord"
                                    />
                                    <button type="button" onClick={handleAddFeature} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 rounded font-bold uppercase tracking-wider text-xs transition-colors">Dodaj Linię</button>
                                </div>

                                <div className="space-y-2 mt-4 bg-black/30 p-4 border border-white/5 rounded-xl border-dashed">
                                    {formData.features.length === 0 && <p className="text-zinc-600 text-sm italic text-center py-4">Brak funkcji. Dodaj elementy wyżej.</p>}
                                    {formData.features.map((feature, index) => (
                                        <div key={index} className="flex justify-between items-center bg-zinc-900 border border-white/5 p-3 rounded-lg group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded bg-boxing-green/20 flex items-center justify-center text-boxing-green text-xs font-mono">{index + 1}</div>
                                                <span className="text-zinc-300 text-sm">{feature}</span>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveFeature(index)} className="text-zinc-600 hover:text-red-500 transition-colors p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-zinc-900/95 backdrop-blur z-10 p-6 border-t border-white/5 flex justify-end gap-4">
                            <button onClick={handleCloseEditor} className="px-6 py-3 bg-transparent text-zinc-400 hover:text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-colors hidden md:block">
                                Anuluj
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full md:w-auto px-8 py-3 bg-boxing-green text-black hover:bg-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 rounded-xl transition-all disabled:opacity-50"
                            >
                                {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Zapisz Pakiet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPlans;

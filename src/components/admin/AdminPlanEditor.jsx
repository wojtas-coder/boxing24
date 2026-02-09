
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save, AlertTriangle, Play, Loader2 } from 'lucide-react';

const AdminPlanEditor = () => {
    const [plans, setPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [jsonContent, setJsonContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('training_plans').select('*');
        if (data) setPlans(data);
        setLoading(false);
    };

    const handleSelectPlan = (planId) => {
        setSelectedPlanId(planId);
        const plan = plans.find(p => p.id === planId);
        if (plan) {
            // Pretty print JSON
            setJsonContent(JSON.stringify(plan.schedule_json, null, 2));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            // Validate JSON
            const parsed = JSON.parse(jsonContent);

            const { error: updateError } = await supabase
                .from('training_plans')
                .update({ schedule_json: parsed, updated_at: new Date() })
                .eq('id', selectedPlanId);

            if (updateError) throw updateError;

            alert('Plan zapisany pomyślnie!');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Błąd formatu JSON');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar: Plan Selector */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Dostępne Plany</h3>
                <div className="space-y-3">
                    {plans.map(plan => (
                        <button
                            key={plan.id}
                            onClick={() => handleSelectPlan(plan.id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedPlanId === plan.id
                                ? 'bg-zinc-800 border-boxing-green text-white'
                                : 'bg-transparent border-white/5 text-zinc-400 hover:border-white/20'}`}
                        >
                            <div className="font-bold uppercase italic">{plan.title}</div>
                            <div className="text-[10px] opacity-60 mt-1">{plan.id}</div>
                        </button>
                    ))}

                    {plans.length === 0 && !loading && (
                        <div className="text-zinc-600 text-sm">Brak planów w bazie. Uruchom skrypt SQL.</div>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col h-[700px]">
                {selectedPlanId ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">Edytor Harmonogramu</h3>
                                <div className="text-xs text-zinc-500 font-mono">Edytujesz: {selectedPlanId}</div>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-boxing-green text-black px-6 py-2 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Zapisz Zmiany
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-xs font-mono mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex-1 relative group">
                            <div className="absolute top-2 right-4 text-[10px] text-zinc-600 font-mono uppercase bg-black/50 px-2 py-1 rounded pointer-events-none z-10">
                                JSON Editor
                            </div>
                            <textarea
                                value={jsonContent}
                                onChange={(e) => setJsonContent(e.target.value)}
                                className="w-full h-full bg-[#111] border border-zinc-800 rounded-xl p-6 font-mono text-xs leading-relaxed text-green-400 focus:outline-none focus:border-boxing-green/30 resize-none selection:bg-boxing-green/30"
                                spellCheck="false"
                            />
                        </div>
                        <div className="mt-4 text-[10px] text-zinc-600">
                            * Format JSON jest kluczowy. Upewnij się, że zachowujesz strukturę tablic i obiektów. Każdy tydzień ma "id", "title" i tablicę "units".
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                        <Play className="w-12 h-12 mb-4 opacity-20" />
                        <p>Wybierz plan z listy po lewej stronie, aby rozpocząć edycję.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPlanEditor;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dumbbell, Plus, Save, Trash2, Calendar, User, CheckCircle, Loader2 } from 'lucide-react';
import { plansLibrary } from '../../data/trainingPlan';

const CoachPlans = () => {
    const { user, session } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const [assigning, setAssigning] = useState(false);

    // Filter only locked/pro plans or show all? Show all.
    const plans = plansLibrary;

    const handleAssignClick = (plan) => {
        setSelectedPlan(plan);
        fetchClients();
    };

    const fetchClients = async () => {
        setLoadingClients(true);
        try {
            const res = await fetch(`/api/coach-fighters?coachId=${user.id}`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setClients(data.fighters || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingClients(false);
        }
    };

    const assignToClient = async (client) => {
        if (!confirm(`Czy na pewno przypisać plan "${selectedPlan.title}" do zawodnika ${client.name}?`)) return;

        setAssigning(true);
        try {
            const res = await fetch('/api/client-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': ... (API doesn't strictly check coach token for this 'client-data' endpoint yet, but usually we should)
                    // The client-data endpoint as written handles 'join_plan' with userId in body.
                },
                body: JSON.stringify({
                    action: 'join_plan',
                    userId: client.profile?.id, // MUST be UUID
                    payload: {
                        planId: selectedPlan.id
                    }
                })
            });

            if (res.ok) {
                alert("Plan przypisany pomyślnie!");
                setSelectedPlan(null);
            } else {
                const err = await res.json();
                alert("Błąd: " + (err.error || "Nieznany błąd"));
            }
        } catch (e) {
            console.error(e);
            alert("Błąd połączenia");
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                        Kreator <span className="text-blue-500">Planów</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Biblioteka i Przypisywanie</p>
                </div>
                {/* <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 font-bold flex items-center gap-2 rounded-xl transition-all">
                    <Plus className="w-4 h-4" /> Nowy Plan
                </button> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl hover:border-blue-500/50 transition-all group flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${plan.level === 'Elite' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                <Dumbbell className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-mono text-zinc-500 border border-white/10 px-2 py-1 rounded">{plan.duration}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{plan.title}</h3>
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-4">{plan.subtitle}</p>
                        <p className="text-sm text-zinc-400 mb-6 flex-1 whitespace-pre-line">{plan.description}</p>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                            <button
                                onClick={() => handleAssignClick(plan)}
                                className="flex-1 py-3 text-xs font-bold uppercase bg-white/5 hover:bg-blue-600 hover:text-white rounded-xl text-center transition-all flex items-center justify-center gap-2"
                            >
                                <User className="w-4 h-4" /> Przypisz
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ASSIGN MODAL */}
            {selectedPlan && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPlan(null)}>
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-white mb-2">Wybierz Zawodnika</h3>
                        <p className="text-zinc-500 text-sm mb-6">Przypisujesz plan: <span className="text-blue-500 font-bold">{selectedPlan.title}</span></p>

                        <div className="max-h-[300px] overflow-y-auto space-y-2 mb-6 pr-2">
                            {loadingClients ? (
                                <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>
                            ) : clients.length === 0 ? (
                                <div className="text-center py-8 text-zinc-500">Brak zawodników</div>
                            ) : (
                                clients.map(client => (
                                    <button
                                        key={client.email} // email unique enough for UI key
                                        disabled={assigning || !client.profile?.id}
                                        onClick={() => assignToClient(client)}
                                        className="w-full flex items-center justify-between p-4 bg-black border border-white/5 hover:border-blue-500/50 rounded-xl transition-all group disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                                                {client.name?.[0]}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-white font-bold text-sm">{client.name}</div>
                                                <div className="text-zinc-600 text-[10px]">{client.email}</div>
                                            </div>
                                        </div>
                                        {!client.profile?.id && <span className="text-[10px] text-red-500">Brak konta</span>}
                                    </button>
                                ))
                            )}
                        </div>

                        <button onClick={() => setSelectedPlan(null)} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase text-xs">
                            Anuluj
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachPlans;

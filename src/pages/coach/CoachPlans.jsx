import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dumbbell, Plus, Save, Trash2, Calendar, User, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { plansLibrary } from '../../data/trainingPlan';

const CoachPlans = () => {
    const { user, session } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [clients, setClients] = useState([]);

    // Plans State
    const [customPlans, setCustomPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    // Initial Form State
    const [newPlan, setNewPlan] = useState({ title: '', subtitle: '', description: '', level: 'Basic', duration: '4 Tygodnie', schedule: [] });

    const [loadingClients, setLoadingClients] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchCustomPlans();
    }, [user]);

    const fetchCustomPlans = async () => {
        try {
            const { data, error } = await supabase
                .from('training_plans')
                .select('*')
                .eq('creator_id', user.id);

            if (data) {
                setCustomPlans(data);
            }
        } catch (e) {
            console.error("Failed to fetch custom plans", e);
        } finally {
            setLoadingPlans(false);
        }
    };

    const handleCreatePlan = async () => {
        if (!newPlan.title) return alert("Podaj tytuł planu");

        try {
            const { data, error } = await supabase
                .from('training_plans')
                .insert([{
                    ...newPlan,
                    creator_id: user.id
                }])
                .select()
                .single();

            if (error) throw error;

            alert("Plan utworzony!");
            setIsCreating(false);
            setNewPlan({ title: '', subtitle: '', description: '', level: 'Basic', duration: '4 Tygodnie', schedule: [] });
            fetchCustomPlans();
        } catch (e) {
            alert(e.message);
        }
    };

    // Combine Static + Custom
    const allPlans = [...customPlans, ...plansLibrary];

    const handleAssignClick = (plan) => {
        setSelectedPlan(plan);
        fetchClients();
    };

    const fetchClients = async () => {
        setLoadingClients(true);
        try {
            // Get users with 'client' role
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('role', 'client');

            if (data) {
                // Map to match the expected 'client' structure in the UI
                setClients(data.map(d => ({
                    name: d.full_name,
                    email: d.email,
                    profile: { id: d.id }
                })));
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
            // Get current active plans
            const { data: prof, error: getErr } = await supabase
                .from('profiles')
                .select('active_plans')
                .eq('id', client.profile.id)
                .single();

            if (getErr) throw getErr;

            const newPlans = Array.from(new Set([...(prof.active_plans || []), selectedPlan.id]));

            const { error: updErr } = await supabase
                .from('profiles')
                .update({ active_plans: newPlans })
                .eq('id', client.profile.id);

            if (updErr) throw updErr;

            alert("Plan przypisany pomyślnie!");
            setSelectedPlan(null);
        } catch (e) {
            console.error(e);
            alert("Błąd przypisywania: " + e.message);
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
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 font-bold flex items-center gap-2 rounded-xl transition-all"
                >
                    <Plus className="w-4 h-4" /> Nowy Szablon
                </button>
            </div>

            {/* CREATE MODAL / FULL SCREEN BUILDER */}
            {isCreating && (
                <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-8">
                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                                    Kreator <span className="text-blue-500">Planu</span>
                                </h2>
                                <p className="text-zinc-500 text-sm">Zbuduj profesjonalny cykl treningowy</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setIsCreating(false)} className="px-6 py-3 text-zinc-400 hover:text-white font-bold uppercase tracking-widest text-xs">Anuluj</button>
                                <button onClick={handleCreatePlan} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-blue-900/20 flex items-center gap-2">
                                    <Save className="w-5 h-5" /> Zapisz Plan
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* LEFT: SETTINGS */}
                            <div className="space-y-6">
                                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
                                    <h3 className="text-lg font-bold text-white mb-4">Ustawienia Główne</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-zinc-500 text-xs font-bold uppercase block mb-2">Nazwa Planu</label>
                                            <input className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:border-blue-500 outline-none font-bold" value={newPlan.title} onChange={e => setNewPlan({ ...newPlan, title: e.target.value })} placeholder="np. Szybkość i Dynamika" />
                                        </div>
                                        <div>
                                            <label className="text-zinc-500 text-xs font-bold uppercase block mb-2">Opis</label>
                                            <textarea className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:border-blue-500 outline-none h-32" value={newPlan.description} onChange={e => setNewPlan({ ...newPlan, description: e.target.value })} placeholder="Dla kogo jest ten plan? Jaki jest cel?" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-zinc-500 text-xs font-bold uppercase block mb-2">Poziom</label>
                                                <select className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:border-blue-500 outline-none" value={newPlan.level} onChange={e => setNewPlan({ ...newPlan, level: e.target.value })}>
                                                    <option value="Basic">Początkujący</option>
                                                    <option value="Pro">Średnio-Zaawansowany</option>
                                                    <option value="Elite">Dla Zawodników</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-zinc-500 text-xs font-bold uppercase block mb-2">Czas Trwania</label>
                                                <input className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:border-blue-500 outline-none" value={newPlan.duration} onChange={e => setNewPlan({ ...newPlan, duration: e.target.value })} placeholder="np. 6 Tygodni" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: BUILDER */}
                            <div className="lg:col-span-2 space-y-6 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-white">Harmonogram Treningów</h3>
                                    <button
                                        onClick={() => setNewPlan(prev => ({
                                            ...prev,
                                            schedule: [...(prev.schedule || []), {
                                                id: Date.now(),
                                                week_name: `Tydzień ${(prev.schedule?.length || 0) + 1}`,
                                                days: []
                                            }]
                                        }))}
                                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                                    >
                                        <Plus className="w-3 h-3" /> Dodaj Tydzień
                                    </button>
                                </div>

                                {(newPlan.schedule || []).map((week, wIndex) => (
                                    <div key={week.id || wIndex} className="bg-zinc-900/80 border border-white/5 rounded-2xl overflow-hidden mb-6">
                                        {/* WEEK HEADER */}
                                        <div className="p-4 bg-white/5 flex justify-between items-center group">
                                            <input
                                                className="bg-transparent text-white font-black uppercase italic tracking-tighter text-lg focus:outline-none w-full"
                                                value={week.week_name}
                                                onChange={e => {
                                                    const newSchedule = [...newPlan.schedule];
                                                    newSchedule[wIndex].week_name = e.target.value;
                                                    setNewPlan({ ...newPlan, schedule: newSchedule });
                                                }}
                                            />
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        const newSchedule = [...newPlan.schedule];
                                                        newSchedule[wIndex].days.push({ id: Date.now(), day_name: 'Nowy Trening', exercises: [] });
                                                        setNewPlan({ ...newPlan, schedule: newSchedule });
                                                    }}
                                                    className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white"
                                                    title="Dodaj Dzień Treningowy"
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newSchedule = newPlan.schedule.filter((_, i) => i !== wIndex);
                                                        setNewPlan({ ...newPlan, schedule: newSchedule });
                                                    }}
                                                    className="p-2 hover:bg-red-500/20 text-red-500 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* DAYS */}
                                        <div className="p-4 space-y-4">
                                            {week.days.length === 0 && (
                                                <div className="text-center py-8 text-zinc-600 text-sm italic border border-dashed border-zinc-800 rounded-xl">
                                                    Brak dni treningowych w tym tygodniu.
                                                </div>
                                            )}
                                            {week.days.map((day, dIndex) => (
                                                <div key={day.id || dIndex} className="bg-black/40 border border-white/5 rounded-xl p-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <input
                                                            className="bg-transparent text-blue-400 font-bold uppercase text-sm focus:outline-none w-full"
                                                            value={day.day_name}
                                                            placeholder="Np. Poniedziałek (Siła)"
                                                            onChange={e => {
                                                                const newSchedule = [...newPlan.schedule];
                                                                newSchedule[wIndex].days[dIndex].day_name = e.target.value;
                                                                setNewPlan({ ...newPlan, schedule: newSchedule });
                                                            }}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const newSchedule = [...newPlan.schedule];
                                                                    newSchedule[wIndex].days[dIndex].exercises.push({ id: Date.now(), name: '', sets: '3', reps: '10', weight: '' });
                                                                    setNewPlan({ ...newPlan, schedule: newSchedule });
                                                                }}
                                                                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded uppercase font-bold"
                                                            >
                                                                + Ćwiczenie
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const newSchedule = [...newPlan.schedule];
                                                                    newSchedule[wIndex].days = newSchedule[wIndex].days.filter((_, i) => i !== dIndex);
                                                                    setNewPlan({ ...newPlan, schedule: newSchedule });
                                                                }}
                                                                className="text-zinc-600 hover:text-red-500"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* EXERCISES */}
                                                    <div className="space-y-2">
                                                        {day.exercises.map((ex, eIndex) => (
                                                            <div key={ex.id || eIndex} className="grid grid-cols-12 gap-2 items-center bg-zinc-900/50 p-2 rounded border border-white/5">
                                                                <div className="col-span-1 text-zinc-500 font-mono text-xs text-center">{eIndex + 1}.</div>
                                                                <div className="col-span-5">
                                                                    <input
                                                                        className="w-full bg-transparent text-white text-xs font-bold focus:outline-none placeholder-zinc-700"
                                                                        placeholder="Nazwa ćwiczenia"
                                                                        value={ex.name}
                                                                        onChange={e => {
                                                                            const newSchedule = [...newPlan.schedule];
                                                                            newSchedule[wIndex].days[dIndex].exercises[eIndex].name = e.target.value;
                                                                            setNewPlan({ ...newPlan, schedule: newSchedule });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <input
                                                                        className="w-full bg-transparent text-zinc-400 text-xs text-center focus:outline-none placeholder-zinc-700"
                                                                        placeholder="Serie"
                                                                        value={ex.sets}
                                                                        onChange={e => {
                                                                            const newSchedule = [...newPlan.schedule];
                                                                            newSchedule[wIndex].days[dIndex].exercises[eIndex].sets = e.target.value;
                                                                            setNewPlan({ ...newPlan, schedule: newSchedule });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <input
                                                                        className="w-full bg-transparent text-zinc-400 text-xs text-center focus:outline-none placeholder-zinc-700"
                                                                        placeholder="Powt."
                                                                        value={ex.reps}
                                                                        onChange={e => {
                                                                            const newSchedule = [...newPlan.schedule];
                                                                            newSchedule[wIndex].days[dIndex].exercises[eIndex].reps = e.target.value;
                                                                            setNewPlan({ ...newPlan, schedule: newSchedule });
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="col-span-1 flex justify-end">
                                                                    <button
                                                                        onClick={() => {
                                                                            const newSchedule = [...newPlan.schedule];
                                                                            newSchedule[wIndex].days[dIndex].exercises = newSchedule[wIndex].days[dIndex].exercises.filter((_, i) => i !== eIndex);
                                                                            setNewPlan({ ...newPlan, schedule: newSchedule });
                                                                        }}
                                                                        className="text-zinc-700 hover:text-red-500"
                                                                    >
                                                                        <XCircle className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {day.exercises.length === 0 && <div className="text-[10px] text-zinc-700 text-center py-2">Brak ćwiczeń</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {(!newPlan.schedule || newPlan.schedule.length === 0) && (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                                        <Calendar className="w-12 h-12 mb-2" />
                                        <p className="text-sm">Dodaj pierwszy tydzień, aby rozpocząć budowanie planu.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allPlans.map(plan => (
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

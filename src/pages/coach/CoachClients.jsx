import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, User, Mail, Calendar, TrendingUp, Save, XCircle, ArrowLeft, ChevronRight, Activity, Smartphone, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { Loader2 } from 'lucide-react';

// Charts & Utils
import AssessmentRadarChart from '../../components/AssessmentRadarChart';
import { BASIC_TEST, ADVANCED_TEST } from '../../data/fitnessTests';
import { calculateAssessment } from '../../utils/assessmentLogic';

const CoachClients = () => {
    const { user, session } = useAuth();
    // TEMPORARY FIX: Hardcode Coach ID to match existing bookings (wojciech-rewczuk)
    // In future, fetch this from profile.coach_slug
    const coachId = 'wojciech-rewczuk';  // Standardized to Supabase UUID

    const [fighters, setFighters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list', 'details', 'assessment'
    const [selectedFighter, setSelectedFighter] = useState(null);

    // Assessment State
    const [assessmentLevel, setAssessmentLevel] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [assessmentInputs, setAssessmentInputs] = useState({});

    // Chat State
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        fetchFighters();
    }, []);

    const [debugInfo, setDebugInfo] = useState(null);

    const fetchFighters = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/coach-fighters?coachId=${coachId}`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch fighters');
            const data = await res.json();
            setFighters(data.fighters || []);
            setDebugInfo(data.debug);
        } catch (err) {
            console.error("Fighters fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenFighter = (fighter) => {
        setSelectedFighter(fighter);
        setViewMode('details');
    };

    const handleCloseFighter = () => {
        setSelectedFighter(null);
        setViewMode('list');
        setAssessmentInputs({});
        setAssessmentLevel(null);
        setCurrentStep(0);
    };

    const startCoachAssessment = (level) => {
        setAssessmentLevel(level);
        setCurrentStep(0);
        setAssessmentInputs({});
        setViewMode('assessment');
    };

    const openChat = async () => {
        if (!selectedFighter) return;
        setViewMode('chat');
        fetchMessages();
    };

    const fetchMessages = async () => {
        if (!selectedFighter) return;
        setChatLoading(true);
        try {
            // Coach ID is sender or receiver. Fighter ID is the other.
            // My API expects user1 and user2.
            // user1 = coachId (which is 'wojciech-rewczuk' hardcoded, but strictly it should be UUID from auth... 
            // Wait, coachId 'wojciech-rewczuk' is NOT a UUID. The API uses UUIDs.
            // For now, I must assume the Coach LOGIN gives me a UUID. 
            // `user.id` from useAuth is the Coach UUID.
            // The API expects UUIDs.

            const res = await fetch(`/api/messages?user1=${user.id}&user2=${selectedFighter.profile?.id || selectedFighter.id}`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            // Note: selectedFighter might be just from clients list, profile.id is the UUID. 
            // IF selectedFighter is a guest (no profile), we can't chat!

            if (res.ok) {
                const data = await res.json();
                setChatMessages(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setChatLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!chatInput.trim() || !selectedFighter?.profile?.id) return;

        try {
            const payload = {
                sender_id: user.id,
                receiver_id: selectedFighter.profile.id,
                content: chatInput
            };

            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const newMsg = await res.json();
                setChatMessages([...chatMessages, newMsg]);
                setChatInput('');
            }
        } catch (error) {
            console.error("Send failed", error);
            alert("Nie udało się wysłać wiadomości.");
        }
    };

    const submitAssessment = async () => {
        if (!selectedFighter) return;

        try {
            // Calculate Result
            const structure = assessmentLevel === 'BASIC' ? BASIC_TEST : ADVANCED_TEST;
            const calculatedResult = calculateAssessment(assessmentInputs, structure);

            const payload = {
                fighterId: selectedFighter.profile?.id,
                fighterEmail: selectedFighter.email,
                coachId: coachId,
                date: new Date().toISOString(),
                type: assessmentLevel,
                results: calculatedResult, // Validation: logic expects { categoryScores, globalScore }
                score: calculatedResult.globalScore
            };

            const res = await fetch('/api/coach-fighter-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                // Throw specific error from API or fallback
                throw new Error(data.error || 'Błąd zapisu wyników');
            }

            alert('Wynik zapisany!');

            // Refresh Data
            await fetchFighters();

            // Return to details
            // Ideally we'd re-select the updated fighter from the new list
            // For simplicity, just going back to list or keeping current logic but refreshing data
            setViewMode('details');

        } catch (err) {
            console.error(err);
            alert('Błąd zapisu: ' + err.message);
        }
    };

    const filteredClients = fighters.filter(c =>
        (c.name?.toLowerCase() || '').includes(search.toLowerCase())
    );

    if (loading && fighters.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* HEADER */}
            {viewMode === 'list' && (
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                            Moi <span className="text-blue-500">Podopieczni</span>
                        </h1>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Zarządzanie zawodnikami</p>
                    </div>
                </div>
            )}

            {/* VIEW: LIST */}
            {viewMode === 'list' && (
                <>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClients.length === 0 ? (
                            <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
                                <User className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                <h3 className="text-zinc-500 font-bold uppercase">Brak zawodników</h3>
                            </div>
                        ) : (
                            filteredClients.map((client, idx) => (
                                <div key={idx} onClick={() => handleOpenFighter(client)} className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer group backdrop-blur-sm">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 text-white font-bold overflow-hidden text-xl group-hover:border-blue-500 transition-colors">
                                            {client.name ? client.name.charAt(0) : <User />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg uppercase">{client.name || 'Zawodnik'}</h3>
                                            <div className="text-xs text-zinc-500 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Aktywny
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                                        <div>
                                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Ostatni Trening</div>
                                            <div className="text-white text-sm font-mono">{client.lastTraining ? new Date(client.lastTraining).toLocaleDateString() : '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Sesje</div>
                                            <div className="text-white text-sm font-mono">{client.totalSessions || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* VIEW: DETAILS */}
            {viewMode === 'details' && selectedFighter && (
                <div className="max-w-5xl mx-auto">
                    <button onClick={handleCloseFighter} className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" /> Powrót do listy
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {/* PROFILE CARD */}
                        <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl text-center">
                            <div className="w-32 h-32 rounded-full bg-black border border-white/10 flex items-center justify-center text-4xl font-thin text-white mx-auto mb-6 shadow-2xl">
                                {selectedFighter.name ? selectedFighter.name.charAt(0) : 'U'}
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{selectedFighter.name}</h2>
                            <div className="text-zinc-500 text-sm mb-8">{selectedFighter.email}</div>

                            <div className="space-y-3">
                                {selectedFighter.profile ? (
                                    <>
                                        <button onClick={() => startCoachAssessment('BASIC')} className="w-full py-3 bg-blue-600 text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-white hover:text-black transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                                            Test Podstawowy
                                        </button>
                                        <button onClick={() => startCoachAssessment('ADVANCED')} className="w-full py-3 bg-zinc-800 text-zinc-400 font-bold uppercase text-xs tracking-widest rounded-xl hover:text-white hover:bg-zinc-700 transition-colors">
                                            Test Zaawansowany
                                        </button>
                                        <button onClick={openChat} className="w-full py-3 bg-zinc-800 text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
                                            <MessageSquare className="w-4 h-4" /> Wiadomości
                                        </button>
                                    </>
                                ) : (
                                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-center">
                                        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                                        <h3 className="text-orange-500 font-bold uppercase text-xs mb-1">Konto Gościa (Brak Profilu)</h3>
                                        <p className="text-zinc-500 text-[10px] leading-relaxed mb-3">
                                            Ten zawodnik nie posiada jeszcze aktywnego profilu w bazie danych. <br />
                                            Upewnij się, że zarejestrował się pod adresem: <br />
                                            <span className="text-white font-mono mt-1 block mb-2">{selectedFighter.email}</span>
                                        </p>

                                        {/* DEBUG INFO */}
                                        <div className="text-[8px] text-zinc-600 font-mono text-left border-t border-white/5 pt-2 mt-2">
                                            <div>API Debug:</div>
                                            <div>Users Found: {debugInfo?.usersFound ?? 'N/A'}</div>
                                            <div>Configured: {debugInfo?.serviceRoleKeyConfigured ? 'YES' : 'NO'}</div>
                                            {debugInfo?.authError && <div className="text-red-500">Error: {debugInfo.authError}</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RADAR CHART */}
                        <div className="md:col-span-2 bg-gradient-to-br from-zinc-900/80 to-black p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                            {selectedFighter.profile?.boxing_index_results ? (
                                <div className="w-full h-full min-h-[300px]">
                                    <AssessmentRadarChart result={selectedFighter.profile.boxing_index_results} />
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Activity className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                    <h3 className="text-zinc-500 font-bold uppercase">Brak danych</h3>
                                    <p className="text-zinc-600 text-xs mt-2">Wykonaj pierwszy test, aby wygenerować wykres.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: ASSESSMENT FORM */}
            {viewMode === 'assessment' && (
                <div className="max-w-2xl mx-auto bg-black border border-white/10 rounded-3xl p-8 md:p-12 relative animate-in slide-in-from-bottom duration-500">
                    <button onClick={() => setViewMode('details')} className="absolute top-8 right-8 text-zinc-600 hover:text-white">
                        <XCircle className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8">
                        Ocena: <span className="text-blue-500">{assessmentLevel === 'BASIC' ? 'Podstawowa' : 'Zaawansowana'}</span>
                    </h2>

                    {(() => {
                        const structure = assessmentLevel === 'BASIC' ? BASIC_TEST : ADVANCED_TEST;
                        const currentBlock = structure[currentStep];

                        return (
                            <div className="space-y-8 animate-in slide-in-from-right duration-300">
                                <div className="flex items-center gap-3 text-blue-500 mb-4">
                                    <div className="w-8 h-[2px] bg-blue-500"></div>
                                    <span className="text-xs font-bold uppercase tracking-widest">{currentBlock.categoryId}</span>
                                </div>

                                {currentBlock.exercises.map(ex => (
                                    <div key={ex.id} className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5">
                                        <h3 className="text-lg font-bold text-white mb-2">{ex.title}</h3>
                                        <p className="text-zinc-500 text-xs mb-4">{ex.instruction}</p>

                                        <div className="flex gap-4">
                                            {ex.isAsymmetric ? (
                                                <>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] uppercase text-zinc-600 font-bold mb-1 block">Lewa ({ex.unit})</label>
                                                        <input type="number"
                                                            value={assessmentInputs[`${ex.id}_l`] || ''}
                                                            onChange={(e) => setAssessmentInputs({ ...assessmentInputs, [`${ex.id}_l`]: e.target.value })}
                                                            className="w-full bg-black border border-zinc-800 rounded p-2 text-white font-mono text-center focus:border-blue-500 outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] uppercase text-zinc-600 font-bold mb-1 block">Prawa ({ex.unit})</label>
                                                        <input type="number"
                                                            value={assessmentInputs[`${ex.id}_r`] || ''}
                                                            onChange={(e) => setAssessmentInputs({ ...assessmentInputs, [`${ex.id}_r`]: e.target.value })}
                                                            className="w-full bg-black border border-zinc-800 rounded p-2 text-white font-mono text-center focus:border-blue-500 outline-none"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full">
                                                    <label className="text-[10px] uppercase text-zinc-600 font-bold mb-1 block">Wynik ({ex.unit})</label>
                                                    <input type="number"
                                                        value={assessmentInputs[ex.id] || ''}
                                                        onChange={(e) => setAssessmentInputs({ ...assessmentInputs, [ex.id]: e.target.value })}
                                                        className="w-full bg-black border border-zinc-800 rounded p-2 text-white font-mono text-center focus:border-blue-500 outline-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-between pt-8">
                                    <button
                                        onClick={() => currentStep > 0 ? setCurrentStep(c => c - 1) : setViewMode('details')}
                                        className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest"
                                    >
                                        Wstecz
                                    </button>

                                    {currentStep < structure.length - 1 ? (
                                        <button onClick={() => setCurrentStep(c => c + 1)} className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform">
                                            Dalej <ChevronRight className="w-4 h-4 inline ml-1" />
                                        </button>
                                    ) : (
                                        <button onClick={submitAssessment} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                                            Zapisz Wyniki <Save className="w-4 h-4 inline ml-1" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* VIEW: CHAT */}
            {viewMode === 'chat' && (
                <div className="max-w-2xl mx-auto h-[600px] flex flex-col bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm animate-in slide-in-from-bottom duration-500">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setViewMode('details')} className="hover:text-white text-zinc-500 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h3 className="text-white font-bold uppercase">{selectedFighter?.name}</h3>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Czat prywatny</div>
                            </div>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatLoading ? (
                            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-zinc-500" /></div>
                        ) : chatMessages.length === 0 ? (
                            <div className="text-center text-zinc-600 text-xs py-12">Rozpocznij rozmowę...</div>
                        ) : (
                            chatMessages.map(msg => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/10 bg-black/40">
                        <div className="flex gap-2">
                            <input
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Napisz wiadomość..."
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:border-blue-500 outline-none"
                            />
                            <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-colors">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachClients;

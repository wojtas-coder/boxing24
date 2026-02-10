import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, CheckCircle, Circle, Play, Eye, ChevronDown, ChevronRight, Clock, Save, ArrowLeft, Calendar, BarChart2, BookOpen, Activity, Flame, Dumbbell, Trophy, Moon, Zap, Smile, AlertCircle, Share2, X, Info, HelpCircle, ArrowRightCircle, MessageSquare, Send, Loader2 } from 'lucide-react';
import BookingCalendar from '../components/BookingCalendar';

const HEAD_COACH_ID = 'e1679220-0798-471b-912e-b1e861e3c30c'; // W. Rewczuk
import { plansLibrary } from '../data/trainingPlan';
import { BASIC_TEST, ADVANCED_TEST, FITNESS_CATEGORIES } from '../data/fitnessTests';
import { calculateAssessment } from '../utils/assessmentLogic';
import AssessmentRadarChart from '../components/AssessmentRadarChart';
import SocialMediaCard from '../components/SocialMediaCard';
import html2canvas from 'html2canvas';

// --- VISUAL COMPONENTS ---

const LevelBadge = ({ level, xp, nextLevelXp }) => (
    <div className="flex flex-col w-full max-w-[200px]">
        <div className="flex items-baseline gap-3 mb-2">
            <span className="text-2xl font-light text-white tracking-tighter">POZIOM <span className="font-semibold">{level}</span></span>
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">POSTĘP <span className="text-boxing-green">{xp}/{nextLevelXp}</span></span>
        </div>
        <div className="w-full h-[2px] bg-zinc-800 rounded-full overflow-hidden">
            <div
                className="h-full bg-boxing-green shadow-[0_0_15px_rgba(0,255,0,0.6)] transition-all duration-1000 ease-out"
                style={{ width: `${(xp / nextLevelXp) * 100}%` }}
            ></div>
        </div>
    </div>
);

const HexagonScore = ({ score }) => (
    <div className="relative w-32 h-32 flex flex-col items-center justify-center">
        <div className="text-6xl font-light text-white tracking-tighter mb-1">{score}</div>
        <div className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-medium">WYNIK</div>
    </div>
);

const SurveySlider = ({ icon: Icon, label, value, onChange }) => (
    <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                <Icon className="w-4 h-4 text-white" /> {label}
            </div>
            <span className="text-sm font-bold text-white font-mono">{value}/10</span>
        </div>
        <input
            type="range" min="1" max="10" step="1"
            value={value} onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-boxing-green hover:accent-white transition-colors"
        />
    </div>
);


const MemberPage = () => {
    const { user, profile, session, loading: authLoading } = useAuth();
    // Local UI states
    const [activeTab, setActiveTab] = useState('dashboard');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareData, setShareData] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // --- GAMIFICATION LOGIC (Derived) ---
    // These defaults will be overwritten by API data
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [nextLevelXp, setNextLevelXp] = useState(500);
    // We calculate this from sessionHistory to keep it synced.

    // We need to access sessionHistory here, but it is defined below. 
    // BUT we are inside the component, so we can't access it before it is defined.
    // Wait, sessionHistory state definition is at line 85.
    // So we should put the derived variables AFTER sessionHistory is defined.
    // I will insert this logic LATER in the file, OR move state definitions up.
    // Better to insert it right before the return statement or after state defs.


    // --- USER STATS (From Profile) ---
    // If profile is loaded, use its data, otherwise defaults
    const [stats, setStats] = useState({ strength: 0, knowledge: 0, discipline: 0, overall: 0 });

    // --- TRAINING STATE ---
    const [completedUnits, setCompletedUnits] = useState([]);
    const [activeUnitId, setActiveUnitId] = useState(null);
    const [viewUnitId, setViewUnitId] = useState(null);

    // --- MULTI-PLAN ARCHITECTURE ---
    const [myPlans, setMyPlans] = useState([]);
    const [viewingPlanId, setViewingPlanId] = useState(null);
    const [dbPlans, setDbPlans] = useState([]); // [NEW] Dynamic plans from DB

    // Combine Static + Dynamic Plans
    const allPlans = [...plansLibrary, ...dbPlans];

    // Derived Schedule logic
    // Derived Schedule logic
    const primaryPlanId = myPlans.length > 0 ? myPlans[0] : null;
    const currentScheduleId = viewingPlanId || primaryPlanId;

    // SAFE ACCESS
    const currentPlan = allPlans.find(p => p.id === currentScheduleId) || allPlans.find(p => p.id == currentScheduleId); // Handle string vs number IDs
    const schedule = currentPlan?.schedule || [];

    // --- SESSION DATA ---
    const [sessionHistory, setSessionHistory] = useState([]);
    const [showWellnessModal, setShowWellnessModal] = useState(false);
    const [showWellnessLegend, setShowWellnessLegend] = useState(false);

    const [wellnessData, setWellnessData] = useState({ energy: 5, sleep: 5, stress: 5, soreness: 5, note: '' });

    // --- WORKOUTS STATE ---
    const [workouts, setWorkouts] = useState({ upcoming: [], history: [] });
    const [loadingWorkouts, setLoadingWorkouts] = useState(false);

    // --- CHAT STATE ---
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    // --- ASSESSMENT STATE ---
    const [showAssessmentModal, setShowAssessmentModal] = useState(false);
    const [assessmentLevel, setAssessmentLevel] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [assessmentInputs, setAssessmentInputs] = useState({});
    const [assessmentResult, setAssessmentResult] = useState(null);

    // --- EFFECT: LOAD USER DATA FROM DB ---
    useEffect(() => {
        if (user && session) {
            fetchClientData();
        }
    }, [user, session]); // Dependency on session for token

    const fetchClientData = async () => {
        if (!user || !session) return;
        try {
            const res = await fetch(`/api/client-data`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                // Map active plans to ID array for compatibility
                setMyPlans(data.plans.map(p => p.plan_id));

                // Map session history
                setSessionHistory(data.history.map(s => ({
                    ...s.stats, // spread stats JSON
                    id: s.id,
                    date: new Date(s.date).toLocaleDateString(),
                    title: s.title,
                    xp: s.xp_earned
                })));

                // Update Gamification
                setLevel(data.gamification?.level || 1);
                setXp(data.gamification?.currentLevelXp || 0);
            }
        } catch (e) {
            console.error("Failed to fetch client data", e);
        }
    };

    // --- EFFECT: LOAD DYNAMIC PLANS ---
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/training-plans');
                if (res.ok) {
                    const { plans } = await res.json();
                    // Normalize DB plans to match UI structure
                    const normalizedPlans = plans.map(p => ({
                        ...p,
                        id: p.id.toString(), // Ensure ID is string for comparison
                        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop', // Default image
                        locked: false // DB plans are unlocked by default for now
                    }));
                    setDbPlans(normalizedPlans);
                }
            } catch (e) {
                console.error("Failed to fetch training plans", e);
            }
        };
        fetchPlans();
    }, []);

    // --- EFFECT: LOAD WORKOUTS ON TAB CHANGE ---
    useEffect(() => {
        if (activeTab === 'my_workouts' && user?.email && session) {
            fetchWorkouts();
        }
    }, [activeTab, user, session]);

    const fetchWorkouts = async () => {
        setLoadingWorkouts(true);
        try {
            // No params needed, token identifies user/mail
            const res = await fetch(`/api/client-bookings`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setWorkouts(data);
            }
        } catch (error) {
            console.error("Failed to fetch workouts:", error);
        } finally {
            setLoadingWorkouts(false);
        }
    };


    // --- CHAT LOGIC ---
    useEffect(() => {
        if (activeTab === 'messages' && user?.id) {
            fetchChatMessages();
        }
    }, [activeTab, user]);

    const fetchChatMessages = async () => {
        if (!user) return;
        setChatLoading(true);
        try {
            // HEAD_COACH_ID is placeholder. If invalid UUID, API might error.
            if (HEAD_COACH_ID === 'REPLACE_WITH_REAL_COACH_UUID') {
                console.warn("Head Coach ID not configured");
                setChatLoading(false);
                return;
            }

            const res = await fetch(`/api/messages?user1=${user.id}&user2=${HEAD_COACH_ID}`);
            if (res.ok) {
                const data = await res.json();
                setChatMessages(data);
            }
        } catch (error) {
            console.error("Chat fetch error:", error);
        } finally {
            setChatLoading(false);
        }
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim() || !user) return;
        if (HEAD_COACH_ID === 'REPLACE_WITH_REAL_COACH_UUID') {
            alert("Konfiguracja czatu niekompletna (Brak ID Trenera).");
            return;
        }

        try {
            const payload = {
                sender_id: user.id,
                receiver_id: HEAD_COACH_ID,
                content: chatInput
            };

            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const newMsg = await res.json();
                setChatMessages([...chatMessages, newMsg]);
                setChatInput('');
            }
        } catch (error) {
            console.error("Chat send error:", error);
            alert("Nie udało się wysłać wiadomości.");
        }
    };


    // --- ACTIONS ---

    const addToMyPlans = async (planId) => {
        if (!user || !session) return;
        try {
            // Optimistic Update
            setMyPlans(prev => [...prev, planId]);

            const res = await fetch('/api/client-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    action: 'add_plan',
                    // userId: user.id, // Removed, handled by token
                    payload: { planId }
                })
            });
            if (!res.ok) throw new Error('Failed to add plan');
            fetchClientData(); // Refresh to ensure sync
            alert('Plan został dodany do Twoich aktywnych programów!');
            setActiveTab('my_plans');
        } catch (e) {
            console.error("Add Plan error:", e);
            alert("Nie udało się dodać planu.");
            setMyPlans(prev => prev.filter(id => id !== planId)); // Rollback
        }
    };

    const removeFromPlans = async (e, planId) => {
        e.stopPropagation();
        if (!confirm('Czy na pewno chcesz porzucić ten plan? Postęp może zostać utracony.')) return;
        if (!user || !session) return;

        try {
            // Optimistic
            setMyPlans(prev => prev.filter(id => id !== planId));

            const res = await fetch('/api/client-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    action: 'remove_plan',
                    // userId: user.id,
                    payload: { planId }
                })
            });

            if (!res.ok) throw new Error('Failed to remove plan');
            fetchClientData();
        } catch (err) {
            console.error(err);
            alert("Błąd usuwania planu.");
            // Fetch to rollback
            fetchClientData();
        }
    };

    const openUnit = (unitId) => playUnit(unitId);

    const playUnit = (unitId) => {
        setViewUnitId(unitId);
        setActiveTab('notebook');
    };

    const triggerFinish = () => setShowWellnessModal(true);

    const saveSession = () => {
        setShowWellnessModal(false);

        // 1. Mark unit as complete
        const unitId = viewUnitId;
        const newCompleted = [...completedUnits, unitId];
        setCompletedUnits(newCompleted);
        localStorage.setItem('boxing24_completed_units', JSON.stringify(newCompleted));

        // 2. Save history entry to DB
        const unitTitle = schedule.flatMap(w => w.units).find(u => u.id === unitId)?.title || "Trening";

        // Optimistic Update
        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            title: unitTitle,
            stats: { wellness: { ...wellnessData }, stats: stats },
            xp: 100
        };
        setSessionHistory([newEntry, ...sessionHistory]);

        // API Call
        if (user && session) {
            fetch('/api/client-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    action: 'complete_session',
                    // userId: user.id,
                    payload: {
                        title: unitTitle,
                        stats: { wellness: wellnessData, ...stats },
                        xp: 100,
                        planId: primaryPlanId,
                        unitId: unitId
                    }
                })
            }).then(() => fetchClientData()); // Refresh to get precise server state
        }

        setViewUnitId(null);
        setActiveTab('dashboard'); // Back to dashboard

        setViewUnitId(null);
        setActiveTab('dashboard'); // Back to dashboard

        // Trigger Share
        setShareData(newEntry);
        setShowShareModal(true);
    };


    // --- ASSESSMENT ACTIONS ---

    const startAssessment = (level) => {
        setAssessmentLevel(level);
        setCurrentStep(0);
        setAssessmentInputs({});
        setAssessmentResult(null);
    };

    const handleAssessmentInput = (id, value) => {
        setAssessmentInputs(prev => ({ ...prev, [id]: value }));
    };

    const nextAssessmentStep = () => {
        const testStructure = assessmentLevel === 'BASIC' ? BASIC_TEST : ADVANCED_TEST;
        if (currentStep < testStructure.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishAssessment();
        }
    };

    const prevAssessmentStep = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
        else setAssessmentLevel(null);
    };

    const finishAssessment = async () => {
        const testStructure = assessmentLevel === 'BASIC' ? BASIC_TEST : ADVANCED_TEST;
        const results = calculateAssessment(assessmentInputs, testStructure);

        setAssessmentResult(results);

        // Update User Global Stats Locally
        const newStats = {
            strength: results.categoryScores.strength || stats.strength,
            knowledge: results.categoryScores.foundation || stats.knowledge,
            discipline: results.categoryScores.capacity || stats.discipline,
            overall: results.globalScore
        };
        setStats(prev => ({ ...prev, ...newStats }));

        // SAVE TO SUPABASE
        if (user) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        boxing_index_results: results,
                        // Optionally we could update separate columns if we wanted strictly structured data
                    })
                    .eq('id', user.id);

                if (error) throw error;
                console.log("Wyniki zapisane w bazie!");
            } catch (err) {
                console.error("Błąd zapisu wyników:", err);
                alert("Nie udało się zapisać wyników w bazie. Sprawdź połączenie.");
            }
        }
    };

    const closeAssessment = () => {
        setShowAssessmentModal(false);
        setAssessmentLevel(null);
        setAssessmentResult(null);
    };

    // Social Media Download Logic
    const socialCardRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadSocialCard = async (format) => {
        if (!socialCardRef.current || !assessmentResult) return;
        setIsDownloading(true);

        try {
            // We need to render the card visible for a split second or clone it. 
            // Better approach: Render it hidden but valid in DOM, or use a portal.
            // For simplicity, we assume it's rendered in a hidden container but with dimensions.

            const cardElement = document.getElementById(`social-card-${format}`);
            if (!cardElement) throw new Error('Card element not found');

            const canvas = await html2canvas(cardElement, {
                scale: 2, // High res
                backgroundColor: '#050505',
                logging: false,
                useCORS: true
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `boxing24-score-${format}-${Date.now()}.png`;
            link.click();

        } catch (err) {
            console.error('Download failed', err);
        } finally {
            setIsDownloading(false);
        }
    };

    // Protected Route handles auth check now


    // --- RENDER HELPERS ---
    const getUnitStatus = (uid) => {
        if (completedUnits.includes(uid)) return 'DONE';
        if (uid === activeUnitId) return 'ACTIVE';
        return 'LOCKED';
    };

    // --- DERIVED STATE (Moved here to have access to sessionHistory) ---
    // --- DERIVED STATE REMOVED (Handled by API State) ---

    return (
        <div className="pt-28 pb-20 min-h-screen bg-[#050505] text-white selection:bg-boxing-green selection:text-white font-sans">
            <div className="max-w-6xl mx-auto px-4 md:px-8">

                {/* --- HEADER: PROFILE --- */}
                <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 mb-16 pb-8 border-b border-white/5 bg-gradient-to-r from-zinc-900/20 to-transparent p-6 md:p-8 rounded-3xl backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
                        {/* Avatar Container */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-boxing-green/20 blur-xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                            <div className="w-24 h-24 rounded-3xl bg-black border border-white/10 flex items-center justify-center text-white font-thin text-4xl shadow-2xl relative z-10 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'M'}
                            </div>
                        </div>

                        <div>
                            <h1 className="text-3xl md:text-5xl font-thin text-white tracking-tighter mb-1 leading-none">
                                {profile?.full_name || user?.email?.split('@')[0] || 'Member'}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                                <div className="h-px w-8 bg-boxing-green/50"></div>
                                <div className="text-[10px] font-black text-boxing-green uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">Elite Member</div>
                            </div>

                            {/* Level Badge Component Here */}
                            <LevelBadge level={level} xp={xp} nextLevelXp={nextLevelXp} />
                        </div>
                    </div>

                    {/* TABS (Scrollable on Mobile) */}
                    <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                        <div className="bg-zinc-900/50 p-1 rounded-2xl flex border border-white/5 min-w-max">
                            {[
                                { id: 'dashboard', label: 'Pulpit' },
                                { id: 'my_workouts', label: 'Moje Treningi' },
                                { id: 'messages', label: 'Wiadomości' },
                                { id: 'my_plans', label: 'Plany' },
                                { id: 'library', label: 'Biblioteka' },
                                { id: 'notebook', label: 'Dziennik' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap
                                        ${activeTab === tab.id ? 'bg-white text-black shadow-none' : 'text-gray-500 hover:text-white'}
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- CONTENT --- */}

                {/* 1. DASHBOARD */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* LEFT: STATS COLUMN */}
                        <div className="space-y-6">
                            {/* HEXAGON */}
                            {/* HEXAGON */}
                            {/* HEXAGON - TITANIUM MATTE */}
                            <div className="bg-gradient-to-br from-zinc-800/60 to-black rounded-3xl p-8 border-t border-white/10 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md shadow-2xl">
                                <HexagonScore score={stats.overall} />
                                <div className="grid grid-cols-3 gap-4 w-full mt-8 pt-8 border-t border-white/5">
                                    <div className="text-center">
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Siła</div>
                                        <div className="text-xl font-light text-white">{stats.strength}</div>
                                    </div>
                                    <div className="text-center border-l border-white/5 border-r">
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Wiedza</div>
                                        <div className="text-xl font-light text-white">{stats.knowledge}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Dysc.</div>
                                        <div className="text-xl font-light text-white">{stats.discipline}</div>
                                    </div>
                                </div>
                            </div>

                            {/* MINI STATS - METALLIC MATTE */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-blue-900/80 to-slate-900 rounded-2xl p-6 border-t border-blue-500/30 shadow-lg relative overflow-hidden group hover:brightness-110 transition-all backdrop-blur-md">
                                    <div className="relative z-10">
                                        <div className="text-3xl font-black text-white mb-1 drop-shadow-md">{sessionHistory.length}</div>
                                        <div className="text-[9px] text-blue-200 font-bold uppercase tracking-widest opacity-80">Sesje</div>
                                    </div>
                                    <BarChart2 className="absolute right-4 bottom-4 w-12 h-12 text-blue-950/50 group-hover:text-blue-500/20 transition-colors" />
                                </div>
                                <div className="bg-gradient-to-br from-purple-900/80 to-slate-900 rounded-2xl p-6 border-t border-purple-500/30 shadow-lg relative overflow-hidden group hover:brightness-110 transition-all backdrop-blur-md">
                                    <div className="relative z-10">
                                        <div className="text-3xl font-black text-white mb-1 drop-shadow-md">{level}</div>
                                        <div className="text-[9px] text-purple-200 font-bold uppercase tracking-widest opacity-80">Poziom</div>
                                    </div>
                                    <Trophy className="absolute right-4 bottom-4 w-12 h-12 text-purple-950/50 group-hover:text-purple-500/20 transition-colors" />
                                </div>
                            </div>

                            {/* ASSESSMENT BUTTON - METALLIC MATTE */}
                            <button
                                onClick={() => setShowAssessmentModal(true)}
                                className="w-full bg-gradient-to-br from-emerald-900/80 to-slate-900 rounded-2xl p-6 border-t border-emerald-500/30 shadow-lg relative overflow-hidden group hover:brightness-110 transition-all text-left backdrop-blur-md"
                            >
                                <div className="relative z-10 flex justify-between items-center">
                                    <div>
                                        <div className="text-xl font-bold text-white mb-1 drop-shadow-sm group-hover:text-emerald-300 transition-colors">Test Sprawności</div>
                                        <div className="text-[10px] text-emerald-200/70 font-bold uppercase tracking-widest">Zaktualizuj Wyniki</div>
                                    </div>
                                    <Activity className="w-8 h-8 text-emerald-950/50 group-hover:text-emerald-400/30 transition-colors" />
                                </div>
                            </button>
                        </div>

                        {/* CENTER/RIGHT: ACTIVE MISSION OR WELCOME */}
                        <div className="lg:col-span-2">
                            {myPlans.length > 0 ? (
                                <div className="h-full bg-gradient-to-br from-zinc-800/40 to-black rounded-3xl p-8 border-t border-white/10 relative flex flex-col justify-between group cursor-pointer hover:brightness-110 transition-all overflow-hidden shadow-2xl backdrop-blur-sm"
                                    onClick={() => { setViewingPlanId(primaryPlanId); setActiveTab('my_plans'); }}
                                >
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex gap-4 items-center">
                                                <span className="px-3 py-1 bg-white/5 text-white text-[10px] font-bold uppercase tracking-widest rounded border border-white/10">
                                                    Na dzisiaj
                                                </span>
                                                <span className="text-xs text-gray-500 uppercase font-bold tracking-widest flex items-center gap-2">
                                                    <Circle className="w-2 h-2 fill-current" />
                                                    {allPlans.find(p => p.id == primaryPlanId)?.title}
                                                </span>
                                            </div>
                                            <div className="p-2 transition-colors">
                                                <ArrowRightCircle className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <h2 className="text-4xl md:text-5xl font-light text-white mb-4 uppercase leading-[0.9]">
                                                {allPlans.find(p => p.id == primaryPlanId)?.schedule.flatMap(w => w.units).find(u => u.id === activeUnitId)?.title || "Misja Ukończona"}
                                            </h2>
                                            <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
                                                Twój obecny cel treningowy. Precyzja ruchu i kontrola.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Postęp Cyklu</div>
                                            <div className="text-xl font-light text-white">30%</div>
                                        </div>
                                        <div className="w-full bg-white/5 h-[1px] rounded-full overflow-hidden">
                                            <div className="bg-boxing-green h-full w-[30%]"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full bg-[#111] rounded-3xl border border-dashed border-zinc-800 flex flex-col items-center justify-center p-12 text-center" >
                                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                                        <Dumbbell className="w-8 h-8 text-zinc-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase italic mb-2">Brak Aktywnego Planu</h3>
                                    <p className="text-zinc-500 mb-8 font-medium text-sm max-w-sm">
                                        Nie masz jeszcze wybranej ścieżki. Przejdź do biblioteki i wybierz program odpowiedni dla siebie.
                                    </p>
                                    <button onClick={() => setActiveTab('library')} className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                        Otwórz Bibliotekę
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 1.5 MY WORKOUTS (Bookings) */}
                {activeTab === 'my_workouts' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-2">
                                Moje <span className="text-boxing-neon">Treningi</span>
                            </h2>
                            <p className="text-gray-400">Twoje nadchodzące rezerwacje i historia spotkań.</p>
                            <div className="mt-8">
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="px-8 py-3 bg-boxing-green text-black font-black uppercase tracking-widest rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                >
                                    + Zarezerwuj Nowy Trening
                                </button>
                            </div>
                        </div>

                        {loadingWorkouts ? (
                            <div className="text-center py-20 text-zinc-500 animate-pulse font-mono text-xs">Ładowanie harmonogramu...</div>
                        ) : (
                            <div className="space-y-12">
                                {/* UPCOMING */}
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-2 h-2 rounded-full bg-boxing-neon shadow-[0_0_10px_rgba(204,255,0,0.5)]"></div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Nadchodzące</h3>
                                    </div>

                                    {workouts.upcoming.length === 0 ? (
                                        <div className="p-8 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 text-center">
                                            <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-4">Brak zaplanowanych treningów</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {workouts.upcoming.map(booking => (
                                                <div key={booking.id} className="bg-[#111] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-boxing-neon/30 transition-all">
                                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                                        <div className="w-16 h-16 bg-zinc-900 rounded-xl flex flex-col items-center justify-center border border-white/5 text-zinc-400 group-hover:text-white transition-colors">
                                                            <span className="text-xs font-bold uppercase">{new Date(booking.start_time).toLocaleDateString('pl-PL', { weekday: 'short' })}</span>
                                                            <span className="text-xl font-black">{new Date(booking.start_time).getDate()}</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-boxing-neon text-[10px] font-bold uppercase tracking-widest mb-1">
                                                                {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <h4 className="text-xl font-black italic text-white uppercase">{booking.coach_name}</h4>
                                                            <div className="text-xs text-gray-500 font-medium">Trening Personalny</div>
                                                        </div>
                                                    </div>
                                                    <div className="w-full md:w-auto text-center md:text-right">
                                                        <span className="px-4 py-2 rounded-lg bg-boxing-neon/10 text-boxing-neon border border-boxing-neon/20 text-[10px] font-bold uppercase tracking-widest">
                                                            Potwierdzony
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* HISTORY */}
                                <div>
                                    <div className="flex items-center gap-3 mb-6 opacity-60">
                                        <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Historia</h3>
                                    </div>

                                    {workouts.history.length === 0 ? (
                                        <div className="text-zinc-600 text-xs italic">Brak historii treningów.</div>
                                    ) : (
                                        <div className="grid gap-4 opacity-60 hover:opacity-100 transition-opacity">
                                            {workouts.history.map(booking => (
                                                <div key={booking.id} className="bg-zinc-900/30 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-zinc-500 font-mono text-xs">
                                                            {new Date(booking.start_time).toLocaleDateString()}
                                                        </div>
                                                        <div className="font-bold text-white text-sm uppercase">
                                                            {booking.coach_name}
                                                        </div>
                                                    </div>
                                                    <div className="px-3 py-1 bg-zinc-800 rounded text-[9px] font-bold uppercase text-zinc-500">
                                                        Ukończony
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 1.6 MESSAGES (Chat) */}
                {activeTab === 'messages' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto h-[600px] flex flex-col bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                    Twój <span className="text-boxing-neon">Trener</span>
                                </h2>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Kanał Bezpośredni</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-boxing-neon flex items-center justify-center text-black font-bold">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {HEAD_COACH_ID === 'REPLACE_WITH_REAL_COACH_UUID' ? (
                                <div className="text-center p-8 border border-orange-500/20 bg-orange-500/10 rounded-xl">
                                    <p className="text-orange-500 font-bold uppercase text-xs mb-2">Konfiguracja Wymagana</p>
                                    <p className="text-zinc-500 text-xs">ID Trenera nie zostało ustawione w systemie.</p>
                                </div>
                            ) : chatLoading ? (
                                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500 w-8 h-8" /></div>
                            ) : chatMessages.length === 0 ? (
                                <div className="text-center text-zinc-600 text-xs py-20">
                                    <p className="uppercase font-bold tracking-widest mb-2">Brak wiadomości</p>
                                    <p>Napisz do trenera, aby rozpocząć rozmowę.</p>
                                </div>
                            ) : (
                                chatMessages.map(msg => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-boxing-neon text-black rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none'}`}>
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
                                    onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                                    placeholder="Napisz wiadomość..."
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-boxing-neon outline-none text-sm transition-colors"
                                />
                                <button onClick={sendChatMessage} className="bg-boxing-neon hover:bg-white text-black p-3 rounded-xl transition-colors">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* REST OF TABS (Library, Notebook, Plans) - Keeping existing logic but simplified in view for brevity */}

                {/* 2. MY PLANS */}
                {activeTab === 'my_plans' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-8">
                            Moje <span className="text-boxing-neon">Plany</span>
                        </h2>

                        {myPlans.length > 0 ? (
                            <div className="space-y-6">
                                {myPlans.map(planId => {
                                    const plan = allPlans.find(p => p.id == planId);
                                    if (!plan) return null;
                                    return (
                                        <div key={plan.id} className="bg-[#111] rounded-3xl p-6 border border-white/5 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-boxing-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                            <div className="w-full md:w-48 h-32 md:h-auto shrink-0 rounded-2xl overflow-hidden relative">
                                                <img src={plan.image} alt={plan.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="text-[10px] bg-white/10 text-white px-2 py-1 rounded inline-block mb-2 uppercase font-bold tracking-wider">{plan.level}</div>
                                                        <h3 className="text-2xl font-black text-white uppercase italic mb-1">{plan.title}</h3>
                                                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{plan.subtitle}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => { setViewingPlanId(plan.id); setActiveTab('notebook'); }}
                                                            className="p-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors"
                                                            title="Otwórz Plan"
                                                        >
                                                            <BookOpen className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => removeFromPlans(e, plan.id)}
                                                            className="p-3 bg-zinc-900 text-zinc-500 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-colors"
                                                            title="Usuń Plan"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex items-center gap-4 text-xs font-mono text-zinc-400">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {plan.duration}</span>
                                                    <span>•</span>
                                                    <span>{plan.schedule?.length || 0} Tygodni</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl">
                                <p className="text-zinc-500 text-sm mb-4">Nie masz aktywnych planów treningowych.</p>
                                <button onClick={() => setActiveTab('library')} className="text-boxing-neon hover:text-white underline uppercase font-bold text-xs tracking-widest">
                                    Przejdź do Biblioteki
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. LIBRARY */}
                {activeTab === 'library' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
                                Biblioteka <span className="text-boxing-green">Programów</span>
                            </h2>
                            <p className="text-gray-400 max-w-xl mx-auto text-sm">
                                Wybierz ścieżkę rozwoju dopasowaną do Twojego celu. Od fundamentów techniki po elitarną siłę eksplozywną.
                            </p>

                            {/* Filter Pills */}
                            <div className="flex flex-wrap justify-center gap-2 mt-8">
                                {[
                                    { id: 'all', label: 'Wszystkie' },
                                    { id: 'Basic', label: 'Początkujący' },
                                    { id: 'Pro', label: 'Zaawansowany' },
                                    { id: 'Elite', label: 'Elita' }
                                ].map(filter => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setActiveFilter(filter.id)}
                                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all
                                            ${activeFilter === filter.id
                                                ? 'bg-white text-black border-white'
                                                : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}
                                        `}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allPlans
                                .filter(p => activeFilter === 'all' || p.level === activeFilter)
                                .map(plan => {
                                    const isAdded = myPlans.includes(plan.id);
                                    return (
                                        <div key={plan.id} className="group bg-[#111] rounded-3xl overflow-hidden border border-white/5 hover:border-boxing-green/50 transition-all flex flex-col relative h-full">
                                            {plan.locked && (
                                                <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-[2px]">
                                                    <div className="flex items-center gap-2 text-white/50 font-bold uppercase tracking-widest text-xs">
                                                        <Lock className="w-4 h-4" /> Dostęp Zablokowany
                                                    </div>
                                                </div>
                                            )}

                                            <div className="h-48 overflow-hidden relative">
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent z-10"></div>
                                                <img
                                                    src={plan.image || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2000&auto=format&fit=crop"}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-80"
                                                    alt={plan.title}
                                                />
                                                <div className="absolute top-4 right-4 z-20">
                                                    <span className={`px-3 py-1 rounded backdrop-blur-md text-[10px] font-bold uppercase tracking-widest border ${plan.level === 'Elite' ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' :
                                                        plan.level === 'Pro' ? 'bg-blue-500/20 border-blue-500/50 text-blue-500' :
                                                            'bg-white/20 border-white/50 text-white'
                                                        }`}>
                                                        {plan.level}
                                                    </span>
                                                </div>
                                                <div className="absolute bottom-4 left-4 z-20">
                                                    <h3 className="text-2xl font-black text-white uppercase italic leading-none">{plan.title}</h3>
                                                    <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold mt-1">{plan.subtitle}</p>
                                                </div>
                                            </div>

                                            <div className="p-6 flex-1 flex flex-col">
                                                <p className="text-zinc-500 text-xs leading-relaxed mb-6 whitespace-pre-line">
                                                    {plan.description}
                                                </p>

                                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                    <div className="text-xs font-mono text-zinc-400">
                                                        <Clock className="w-3 h-3 inline mr-2 text-boxing-green" />
                                                        {plan.duration}
                                                    </div>

                                                    {isAdded ? (
                                                        <button disabled className="px-4 py-2 bg-zinc-800 text-zinc-500 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-default flex items-center gap-2">
                                                            <CheckCircle className="w-3 h-3" /> Dodano
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => addToMyPlans(plan.id)}
                                                            disabled={plan.locked}
                                                            className="px-4 py-2 bg-white text-black hover:bg-boxing-green transition-colors rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Rozpocznij
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {/* 4. NOTEBOOK (Workout View) */}
                {activeTab === 'notebook' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                        {!currentPlan ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="w-8 h-8 text-zinc-700" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Dziennik jest pusty</h3>
                                <p className="text-zinc-500 text-sm mb-6">Wybierz plan treningowy, aby zobaczyć swoje jednostki.</p>
                                <button onClick={() => setActiveTab('library')} className="px-8 py-3 bg-white text-black rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-zinc-200">
                                    Otwórz Bibliotekę
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                {/* WEEK SELECTOR (Left) */}
                                <div className="lg:col-span-1 space-y-8">
                                    <div>
                                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Twój Plan</h3>
                                        <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                                            <div className="text-lg font-black text-white uppercase italic">{currentPlan.title}</div>
                                            <div className="text-[10px] text-boxing-green font-bold uppercase tracking-widest mt-1">{currentPlan.duration}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Harmonogram</h3>
                                        {schedule.map((week) => (
                                            <div key={week.id} className="space-y-1">
                                                <div className="text-[10px] uppercase font-bold text-zinc-600 pl-2 mt-4 mb-2">{week.title}</div>
                                                {week.units.map((unit) => {
                                                    const status = getUnitStatus(unit.id);
                                                    const isSelected = viewUnitId === unit.id;

                                                    return (
                                                        <button
                                                            key={unit.id}
                                                            onClick={() => setViewUnitId(unit.id)}
                                                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border
                                                                ${isSelected ? 'bg-zinc-800 border-zinc-700' : 'hover:bg-zinc-900 border-transparent'}
                                                                ${status === 'LOCKED' ? 'opacity-50' : 'opacity-100'}
                                                            `}
                                                        >
                                                            <div className={`w-2 h-2 rounded-full 
                                                                ${status === 'DONE' ? 'bg-boxing-green' : status === 'ACTIVE' ? 'bg-white' : 'bg-zinc-700'}
                                                            `}></div>
                                                            <div className="flex-1">
                                                                <div className={`text-xs font-bold uppercase tracking-wide
                                                                    ${isSelected ? 'text-white' : 'text-zinc-400'}
                                                                `}>
                                                                    {unit.title}
                                                                </div>
                                                                <div className="text-[9px] text-zinc-600 font-bold uppercase">{unit.type} BLOCK</div>
                                                            </div>
                                                            {status === 'DONE' && <CheckCircle className="w-3 h-3 text-boxing-green" />}
                                                            {status === 'LOCKED' && <Lock className="w-3 h-3 text-zinc-700" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* UNIT VIEW (Center/Right) */}
                                <div className="lg:col-span-3">
                                    {schedule.flatMap(w => w.units).find(u => u.id === viewUnitId) ? (
                                        (() => {
                                            const unit = schedule.flatMap(w => w.units).find(u => u.id === viewUnitId);
                                            const isDone = completedUnits.includes(unit.id);

                                            return (
                                                <div className="bg-[#111] rounded-3xl overflow-hidden border border-white/5 relative min-h-[600px]">
                                                    {/* Header */}
                                                    <div className="p-8 border-b border-white/5 bg-black/40 flex justify-between items-start">
                                                        <div>
                                                            <div className="text-[10px] font-bold text-boxing-green uppercase tracking-[0.3em] mb-2">{currentPlan.title} • {unit.type} BLOCK</div>
                                                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{unit.title}</h2>
                                                            <p className="text-zinc-500 text-sm mt-2">{unit.data.subtitle} • {unit.data.title}</p>
                                                        </div>
                                                        {isDone && (
                                                            <div className="bg-boxing-green/10 text-boxing-green px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-boxing-green/20 flex items-center gap-2">
                                                                <CheckCircle className="w-4 h-4" /> Ukończono
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-8 space-y-8">
                                                        {/* TIPS */}
                                                        {unit.data.tips && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {unit.data.tips.map((tip, idx) => (
                                                                    <div key={idx} className={`p-4 rounded-xl border text-xs font-medium leading-relaxed
                                                                        ${tip.type === 'coach' ? 'bg-blue-900/10 border-blue-500/20 text-blue-200' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}
                                                                    `}>
                                                                        <span className="block font-bold uppercase mb-1 opacity-70">{tip.type === 'coach' ? 'Trener' : 'Info'}</span>
                                                                        {tip.text}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* SECTIONS */}
                                                        {unit.data.sections.map(section => (
                                                            <div key={section.id}>
                                                                <div className={`flex items-center gap-3 mb-4 pb-2 border-b border-zinc-800 ${section.color.replace('border-', 'text-')}`}>
                                                                    <div className={`w-3 h-3 rounded-sm ${section.color.replace('border-', 'bg-')}`}></div>
                                                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">{section.title}</h3>
                                                                </div>

                                                                <div className="space-y-1">
                                                                    {section.rows.map(row => (
                                                                        <div key={row.id} className="grid grid-cols-12 gap-4 py-3 px-4 hover:bg-white/5 rounded-lg transition-colors items-center group">
                                                                            <div className="col-span-6 font-bold text-white text-sm">{row.exercise}</div>
                                                                            <div className="col-span-2 text-zinc-400 text-xs text-center border-l border-zinc-800">{row.sets} <span className="text-[9px] uppercase opacity-50 block">Serie</span></div>
                                                                            <div className="col-span-2 text-zinc-400 text-xs text-center border-l border-zinc-800">{row.reps} <span className="text-[9px] uppercase opacity-50 block">Powt.</span></div>
                                                                            <div className="col-span-2 text-right">
                                                                                {row.input ? (
                                                                                    <div className="flex items-center justify-end gap-1">
                                                                                        <input type="text" placeholder="KG" className="w-12 bg-black border border-zinc-700 rounded text-center text-xs py-1 text-white focus:border-boxing-green outline-none" />
                                                                                    </div>
                                                                                ) : (
                                                                                    row.rest && <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-2 py-1 rounded">{row.rest}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Footer Action */}
                                                    <div className="p-8 border-t border-white/5 bg-black/40 flex justify-end sticky bottom-0 backdrop-blur-md">
                                                        {isDone ? (
                                                            <button disabled className="px-8 py-4 bg-zinc-800 text-zinc-500 rounded-xl font-black uppercase text-xs tracking-widest cursor-default">
                                                                Trening Zaliczony
                                                            </button>
                                                        ) : (
                                                            <button onClick={triggerFinish} className="px-8 py-4 bg-boxing-green text-black rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-2">
                                                                <CheckCircle className="w-5 h-5" /> Oznacz jako Wykonany
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10 min-h-[400px]">
                                            <p className="uppercase font-bold tracking-widest text-xs mb-2">Wybierz jednostkę treningową</p>
                                            <p className="text-[10px]">Kliknij na listę po lewej stronie, aby zobaczyć szczegóły.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* --- BOOKING MODAL --- */}
            {showBookingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-5xl h-[85vh] bg-zinc-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-white/5 bg-black/50">
                            <h3 className="text-white font-bold uppercase tracking-widest pl-2">Rezerwacja Treningu</h3>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto relative">
                            <BookingCalendar
                                calLink={import.meta.env.VITE_CAL_LINK_WOJCIECH || 'wojciech'}
                                onBookingSuccess={() => {
                                    alert('Rezerwacja przyjęta! Sprawdź maila.');
                                    setShowBookingModal(false);
                                    fetchWorkouts(); // Refresh list if possible
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- WELLNESS MODAL --- */}
            {showWellnessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-md w-full">
                        <h3 className="text-2xl font-black text-white uppercase italic mb-6 text-center">Raport Potreningowy</h3>

                        <SurveySlider icon={Zap} label="Poziom Energii" value={wellnessData.energy} onChange={v => setWellnessData({ ...wellnessData, energy: v })} />
                        <SurveySlider icon={Moon} label="Jakość Snu" value={wellnessData.sleep} onChange={v => setWellnessData({ ...wellnessData, sleep: v })} />
                        <SurveySlider icon={AlertCircle} label="Poziom Stresu" value={wellnessData.stress} onChange={v => setWellnessData({ ...wellnessData, stress: v })} />
                        <SurveySlider icon={Dumbbell} label="Zmęczenie Mięśni" value={wellnessData.soreness} onChange={v => setWellnessData({ ...wellnessData, soreness: v })} />

                        <div className="mb-8">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Notatka</label>
                            <textarea
                                value={wellnessData.note}
                                onChange={e => setWellnessData({ ...wellnessData, note: e.target.value })}
                                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-boxing-green outline-none h-24 resize-none"
                                placeholder="Jak się czułeś? Co poszło dobrze?"
                            />
                        </div>

                        <button onClick={saveSession} className="w-full py-4 bg-boxing-green text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform">
                            Zapisz Trening
                        </button>
                    </div>
                </div>
            )}

            {/* --- SHARE MODAL --- */}
            {showShareModal && shareData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
                    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* PREVIEW */}
                        <div className="flex flex-col items-center justify-center">
                            <SocialMediaCard
                                data={{
                                    type: 'workout',
                                    title: shareData.title,
                                    stats: shareData.stats.stats,
                                    date: shareData.date,
                                    score: shareData.xp
                                }}
                                format="story"
                                id="social-card-story"
                            />
                            <button
                                onClick={() => downloadSocialCard('story')}
                                className="mt-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                            >
                                {isDownloading ? <Loader2 className="animate-spin w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                                Pobierz na Instagram Story
                            </button>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-col justify-center text-center md:text-left">
                            <h2 className="text-4xl font-black text-white italic uppercase mb-4">Gratulacje!</h2>
                            <p className="text-zinc-500 mb-8">Trening ukończony. Podziel się wynikiem ze światem i oznacz @boxing24.</p>

                            <div className="space-y-4">
                                <button onClick={() => downloadSocialCard('story')} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white uppercase tracking-widest hover:brightness-110 transition-all">
                                    Udostępnij na Instagramie
                                </button>
                                <button onClick={() => setShowShareModal(false)} className="w-full py-4 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-zinc-500 uppercase tracking-widest hover:text-white hover:bg-zinc-800 transition-all">
                                    Zamknij
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ASSESSMENT MODAL --- */}
            {showAssessmentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
                    <div className="max-w-3xl w-full bg-zinc-950 border border-white/10 rounded-3xl p-8 relative my-8">
                        <button onClick={closeAssessment} className="absolute top-8 right-8 text-zinc-600 hover:text-white"><X /></button>

                        <h2 className="text-3xl font-black text-white uppercase italic mb-8 border-b border-white/10 pb-4">
                            Test Sprawności: <span className="text-boxing-green">{assessmentLevel === 'BASIC' ? 'Podstawowy' : assessmentLevel === 'ADVANCED' ? 'Zaawansowany' : 'Wybierz Poziom'}</span>
                        </h2>

                        {!assessmentLevel && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button onClick={() => startAssessment('BASIC')} className="p-8 bg-zinc-900/50 border border-zinc-800 hover:border-boxing-green rounded-2xl text-left group transition-all">
                                    <div className="text-xl font-bold text-white mb-2 group-hover:text-boxing-green">Poziom Podstawowy</div>
                                    <p className="text-zinc-500 text-sm">Idealny na początek. Sprawdź swoje fundamenty: siłę, wytrzymałość i mobilność.</p>
                                </button>
                                <button onClick={() => startAssessment('ADVANCED')} className="p-8 bg-zinc-900/50 border border-zinc-800 hover:border-red-500 rounded-2xl text-left group transition-all">
                                    <div className="text-xl font-bold text-white mb-2 group-hover:text-red-500">Poziom Zaawansowany</div>
                                    <p className="text-zinc-500 text-sm">Dla doświadczonych zawodników. Pełne spektrum testów motorycznych.</p>
                                </button>
                            </div>
                        )}

                        {assessmentLevel && !assessmentResult && (
                            <div>
                                {(() => {
                                    const structure = assessmentLevel === 'BASIC' ? BASIC_TEST : ADVANCED_TEST;
                                    const currentBlock = structure[currentStep];

                                    return (
                                        <div className="space-y-8 animate-in slide-in-from-right duration-300">
                                            <div className="flex items-center gap-3 text-boxing-green mb-4">
                                                <div className="w-8 h-[2px] bg-boxing-green"></div>
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
                                                                        onChange={(e) => handleAssessmentInput(`${ex.id}_l`, e.target.value)}
                                                                        className="w-full bg-black border border-zinc-800 rounded p-2 text-white font-mono text-center focus:border-boxing-green outline-none"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="text-[10px] uppercase text-zinc-600 font-bold mb-1 block">Prawa ({ex.unit})</label>
                                                                    <input type="number"
                                                                        value={assessmentInputs[`${ex.id}_r`] || ''}
                                                                        onChange={(e) => handleAssessmentInput(`${ex.id}_r`, e.target.value)}
                                                                        className="w-full bg-black border border-zinc-800 rounded p-2 text-white font-mono text-center focus:border-boxing-green outline-none"
                                                                    />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="w-full">
                                                                <label className="text-[10px] uppercase text-zinc-600 font-bold mb-1 block">Wynik ({ex.unit})</label>
                                                                <input type="number"
                                                                    value={assessmentInputs[ex.id] || ''}
                                                                    onChange={(e) => handleAssessmentInput(ex.id, e.target.value)}
                                                                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white font-mono text-center focus:border-boxing-green outline-none"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex justify-between pt-8">
                                                <button
                                                    onClick={prevAssessmentStep}
                                                    className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest"
                                                >
                                                    Wstecz
                                                </button>

                                                {currentStep < structure.length - 1 ? (
                                                    <button onClick={nextAssessmentStep} className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform">
                                                        Dalej <ChevronRight className="w-4 h-4 inline ml-1" />
                                                    </button>
                                                ) : (
                                                    <button onClick={finishAssessment} className="bg-boxing-green text-black px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                                                        Zakończ Test <CheckCircle className="w-4 h-4 inline ml-1" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {assessmentResult && (
                            <div className="text-center animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-boxing-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                                    <Trophy className="w-10 h-10 text-black" />
                                </div>
                                <h2 className="text-4xl font-black text-white italic uppercase mb-2">Wynik: {assessmentResult.globalScore}</h2>
                                <p className="text-zinc-500 mb-8">Twój nowy Boxing Index został obliczony.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="bg-black/50 p-6 rounded-3xl border border-white/10">
                                        <AssessmentRadarChart result={assessmentResult} />
                                    </div>
                                    <div className="space-y-4 text-left">
                                        {Object.entries(assessmentResult.categoryScores).map(([cat, score]) => (
                                            <div key={cat}>
                                                <div className="flex justify-between text-xs uppercase font-bold text-zinc-500 mb-1">
                                                    <span>{cat}</span>
                                                    <span className="text-white">{score}</span>
                                                </div>
                                                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-zinc-700" style={{ width: `${score}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={closeAssessment} className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform">
                                    Zamknij
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default MemberPage;

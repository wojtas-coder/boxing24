import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, CheckCircle, Circle, Play, Eye, ChevronDown, ChevronRight, Clock, Save, ArrowLeft, Calendar, BarChart2, BookOpen, Activity, Flame, Dumbbell, Trophy, Moon, Zap, Smile, AlertCircle, Share2, X, Info, HelpCircle, ArrowRightCircle, MessageSquare, Send, Loader2 } from 'lucide-react';

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
    const { user, profile, loading: authLoading } = useAuth();
    // Local UI states
    const [activeTab, setActiveTab] = useState('dashboard');
    const [activeFilter, setActiveFilter] = useState('all');
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareData, setShareData] = useState(null);

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
        if (user) {
            fetchClientData();
        }
    }, [user, profile]);

    const fetchClientData = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/client-data?userId=${user.id}`);
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
        if (activeTab === 'my_workouts' && user?.email) {
            fetchWorkouts();
        }
    }, [activeTab, user]);

    const fetchWorkouts = async () => {
        setLoadingWorkouts(true);
        try {
            const res = await fetch(`/api/client-bookings?email=${encodeURIComponent(user.email.toLowerCase())}`);
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
        if (!user) return;
        try {
            // Optimistic Update
            setMyPlans(prev => [...prev, planId]);

            const res = await fetch('/api/client-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_plan',
                    userId: user.id,
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
        if (!user) return;

        try {
            // Optimistic
            setMyPlans(prev => prev.filter(id => id !== planId));

            const res = await fetch('/api/client-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'remove_plan',
                    userId: user.id,
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
        if (user) {
            fetch('/api/client-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'complete_session',
                    userId: user.id,
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
                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16 pb-8 border-b border-white/5 bg-gradient-to-r from-zinc-900/20 to-transparent p-8 rounded-3xl backdrop-blur-sm">
                    <div className="flex items-center gap-8">
                        {/* Avatar Container */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-boxing-green/20 blur-xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                            <div className="w-24 h-24 rounded-3xl bg-black border border-white/10 flex items-center justify-center text-white font-thin text-4xl shadow-2xl relative z-10 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                                W
                            </div>
                        </div>

                        <div>
                            <h1 className="text-5xl font-thin text-white tracking-tighter mb-1 leading-none">
                                {profile?.full_name || user?.email?.split('@')[0] || 'Member'}
                            </h1>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-px w-8 bg-boxing-green/50"></div>
                                <div className="text-[10px] font-black text-boxing-green uppercase tracking-[0.3em] drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">Elite Member</div>
                            </div>

                            {/* Level Badge Component Here */}
                            <LevelBadge level={level} xp={xp} nextLevelXp={nextLevelXp} />
                        </div>
                    </div>

                    {/* TABS (Minimalist Pill) */}
                    <div className="bg-zinc-900/50 p-1 rounded-2xl flex border border-white/5">
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
                                className={`px-6 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all
                                    ${activeTab === tab.id ? 'bg-white text-black shadow-none' : 'text-gray-500 hover:text-white'}
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
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
                                            <a href="/booking" className="inline-block px-6 py-2 bg-white text-black rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                                Zarezerwuj Termin
                                            </a>
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
                                            <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${isMe ? 'bg-boxing-neon text-black rounded-br-none font-medium' : 'bg-zinc-800 text-zinc-300 rounded-bl-none border border-white/5'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
                            <div className="flex gap-4">
                                <input
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                                    placeholder="Wpisz wiadomość..."
                                    className="flex-1 bg-zinc-900/80 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-boxing-neon/50 outline-none transition-all placeholder:text-zinc-600"
                                />
                                <button
                                    onClick={sendChatMessage}
                                    className="bg-white text-black w-14 rounded-2xl flex items-center justify-center hover:bg-boxing-neon transition-colors shadow-lg hover:scale-105 active:scale-95 duration-200"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. LIBRARY (Dedicated Tab) */}
                {activeTab === 'library' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-2">
                                    Biblioteka <span className="text-boxing-neon">Planów</span>
                                </h2>
                                <p className="text-gray-400 max-w-xl">
                                    Oficjalne programy treningowe Boxing24. Wybierz jeden lub więcej i realizuj je we własnym tempie.
                                </p>
                            </div>
                            <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-[#111] p-1 rounded-lg border border-white/5">
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className={`px-3 py-1 rounded transition-colors ${activeFilter === 'all' ? 'bg-white/10 text-white' : 'hover:text-white'}`}
                                >
                                    Wszystkie
                                </button>
                                <button
                                    onClick={() => setActiveFilter('basic')}
                                    className={`px-3 py-1 rounded transition-colors ${activeFilter === 'basic' ? 'bg-white/10 text-white' : 'hover:text-white'}`}
                                >
                                    Początkujący
                                </button>
                                <button
                                    onClick={() => setActiveFilter('pro')}
                                    className={`px-3 py-1 rounded transition-colors ${activeFilter === 'pro' ? 'bg-white/10 text-white' : 'hover:text-white'}`}
                                >
                                    Pro
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {allPlans.filter(plan => {
                                if (activeFilter === 'all') return true;
                                if (activeFilter === 'basic') return plan.level === 'Basic';
                                if (activeFilter === 'pro') return plan.level === 'Pro' || plan.level === 'Elite';
                                return true;
                            }).map(plan => {
                                const isActive = myPlans.includes(plan.id);
                                return (
                                    <div key={plan.id} className={`group relative bg-zinc-900/10 rounded-3xl overflow-hidden border transition-all duration-500 hover:-translate-y-1
                                        ${plan.locked ? 'border-white/5 opacity-50' : 'border-white/5 hover:border-white/20'}
                                    `}>
                                        <div className="h-56 relative overflow-hidden">
                                            <img src={plan.image} className="w-full h-full object-cover transition-transform duration-700 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100" alt={plan.title} />

                                            <div className="absolute top-4 right-4 z-20 flex gap-2">
                                                {plan.locked && <div className="bg-black/80 text-white p-2 rounded-full backdrop-blur-md"><Lock className="w-4 h-4" /></div>}
                                                {isActive && <div className="bg-boxing-green text-black px-3 py-1.5 rounded-full font-bold text-[10px] uppercase flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aktywny</div>}
                                            </div>
                                            <div className="absolute bottom-4 left-4 z-20">
                                                <div className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-black/80 text-white backdrop-blur">
                                                    {plan.level}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-2xl font-black text-white uppercase italic leading-none">{plan.title}</h3>
                                            </div>
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> {plan.duration}
                                            </div>

                                            <p className="text-sm text-gray-400 leading-relaxed mb-8 line-clamp-2">
                                                {plan.description}
                                            </p>

                                            <div className="pt-6 border-t border-white/5">
                                                {plan.locked ? (
                                                    <button disabled className="w-full py-3 text-gray-600 font-bold uppercase text-xs tracking-widest cursor-not-allowed flex items-center justify-center gap-2 bg-zinc-900/50 rounded-xl border border-white/5">
                                                        Tylko VIP <Lock className="w-3 h-3" />
                                                    </button>
                                                ) : isActive ? (
                                                    <button
                                                        onClick={() => { setViewingPlanId(plan.id); setActiveTab('my_plans'); }}
                                                        className="w-full py-3 bg-zinc-800 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        Przejdź do Planu <ArrowRightCircle className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => addToMyPlans(plan.id)}
                                                        className="w-full py-3 bg-white text-black rounded-xl font-black uppercase text-xs tracking-widest hover:bg-boxing-neon transition-colors"
                                                    >
                                                        + Rozpocznij
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* 3. MY PLANS & SCHEDULE VIEW */}
                {activeTab === 'my_plans' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* A) SINGLE PLAN VIEW (SCHEDULE) */}
                        {viewingPlanId ? (
                            <div className="space-y-8">
                                <div className="flex items-center gap-6 mb-8">
                                    <button onClick={() => setViewingPlanId(null)} className="group bg-[#111] hover:bg-white p-4 rounded-full border border-white/10 transition-colors">
                                        <ArrowLeft className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                                    </button>
                                    <div>
                                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter loading-none">
                                            {plansLibrary.find(p => p.id === viewingPlanId)?.title}
                                        </h2>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                                            Harmonogram Treningowy
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden">
                                    {(plansLibrary.find(p => p.id === viewingPlanId)?.schedule || []).map((week, idx) => (
                                        <div key={week.id} className="border-b border-white/5 last:border-0">
                                            <div className="bg-zinc-900/40 px-8 py-4 border-b border-white/[0.02] flex justify-between items-center backdrop-blur-sm sticky top-0 z-10">
                                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{week.title}</h3>
                                                {idx === 0 && <span className="text-[9px] bg-boxing-neon/20 text-boxing-neon border border-boxing-neon/20 px-2 py-0.5 rounded font-bold uppercase">Obecny Tydzień</span>}
                                            </div>
                                            <div className="divide-y divide-white/5">
                                                {week.units.map(unit => {
                                                    const status = getUnitStatus(unit.id);
                                                    return (
                                                        <div key={unit.id} onClick={() => openUnit(unit.id)}
                                                            className={`p-6 md:p-8 flex items-center justify-between group transition-all duration-300
                                                                ${status === 'ACTIVE' ? 'bg-boxing-neon/[0.02] hover:bg-boxing-neon/[0.05] cursor-pointer' : ''}
                                                                ${status === 'LOCKED' ? 'opacity-40 cursor-pointer hover:bg-white/[0.02]' : ''}
                                                                ${status === 'DONE' ? 'opacity-60 grayscale cursor-pointer hover:bg-white/[0.02]' : ''}
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-8">
                                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border 
                                                                    ${status === 'ACTIVE' ? 'border-boxing-neon bg-boxing-neon/10 text-boxing-neon shadow-[0_0_20px_rgba(204,255,0,0.2)]' :
                                                                        status === 'DONE' ? 'border-zinc-700 bg-zinc-800 text-gray-500' : 'border-zinc-800/50 bg-zinc-900/50 text-zinc-700'}
                                                                `}>
                                                                    {status === 'ACTIVE' ? <Play className="w-6 h-6 fill-current" /> :
                                                                        status === 'DONE' ? <CheckCircle className="w-6 h-6" /> : <Lock className="w-5 h-5" />
                                                                    }
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-3 mb-1.5">
                                                                        <h4 className={`text-xl font-black italic uppercase ${status === 'ACTIVE' ? 'text-white' : 'text-zinc-500'}`}>{unit.title}</h4>
                                                                        {status === 'ACTIVE' && <span className="px-2 py-0.5 bg-boxing-neon text-black text-[9px] font-black rounded uppercase">Teraz</span>}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 font-mono tracking-wide">{unit.data.subtitle}</div>
                                                                </div>
                                                            </div>
                                                            <div className={`p-3 rounded-full border border-white/5 bg-zinc-900/50 group-hover:bg-white group-hover:text-black transition-all
                                                                ${status === 'ACTIVE' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                                                            `}>
                                                                <ChevronRight className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // B) LIST OF MY PLANS
                            <div className="max-w-4xl mx-auto">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Twoje Programy</h2>
                                    <p className="text-gray-500 text-sm">Zarządzaj swoimi aktywnymi cyklami treningowymi.</p>
                                </div>

                                {myPlans.length === 0 ? (
                                    <div className="text-center py-24 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                                        <div className="w-20 h-20 bg-[#111] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                                            <Calendar className="w-8 h-8 text-zinc-600" />
                                        </div>
                                        <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest mb-6">Nie masz aktywnych planów</p>
                                        <button onClick={() => setActiveTab('library')} className="text-boxing-neon font-bold uppercase text-xs tracking-widest border-b border-boxing-neon/30 pb-1 hover:text-white hover:border-white transition-colors">
                                            + Dodaj pierwszy plan
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myPlans.map(pid => {
                                            const plan = plansLibrary.find(p => p.id === pid);
                                            return (
                                                <div key={pid} className="bg-[#111] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-8 group hover:border-white/20 transition-all cursor-pointer"
                                                    onClick={() => setViewingPlanId(pid)}
                                                >
                                                    <div className="w-full md:w-32 h-24 rounded-2xl overflow-hidden bg-zinc-800 relative flex-shrink-0 shadow-lg">
                                                        <img src={plan.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                    </div>
                                                    <div className="flex-grow text-center md:text-left">
                                                        <h3 className="text-2xl font-black text-white uppercase italic leading-none mb-2">{plan.title}</h3>
                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex justify-center md:justify-start gap-4">
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {plan.duration}</span>
                                                            <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {plan.level}</span>
                                                        </div>
                                                        <div className="w-full max-w-sm bg-black h-2 rounded-full overflow-hidden border border-white/5">
                                                            <div className="bg-white h-full w-[10%]"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 w-full md:w-auto items-center">
                                                        <ArrowRightCircle className="w-8 h-8 text-zinc-700 group-hover:text-boxing-neon transition-colors" />
                                                        <button onClick={(e) => removeFromPlans(e, pid)} className="p-3 border border-zinc-800 text-zinc-600 rounded-xl hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-colors" title="Porzuć Plan">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <button onClick={() => setActiveTab('library')} className="w-full py-6 mt-4 border border-dashed border-zinc-800 text-zinc-600 font-bold uppercase text-xs tracking-widest rounded-3xl hover:border-boxing-neon hover:text-boxing-neon transition-colors">
                                            + Dodaj Kolejny Plan
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}


                {/* 4. NOTEBOOK / JOURNAL (Redesign) */}
                {activeTab === 'notebook' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {!viewUnitId ? (
                            // JOURNAL FEED VIEW
                            <div className="max-w-2xl mx-auto">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Twój Dziennik</h2>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold flex justify-center gap-4">
                                        <span>{sessionHistory.length} Treningów</span>
                                        <span>&bull;</span>
                                        <span>Level {level}</span>
                                    </div>
                                </div>

                                {sessionHistory.length === 0 ? (
                                    <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl">
                                        <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-4" />
                                        <p className="text-zinc-500 text-sm">Historia tworzy się w ringu. Ukończ pierwszy trening.</p>
                                    </div>
                                ) : (
                                    <div className="relative border-l border-white/10 ml-4 md:ml-0 space-y-8 pb-12">

                                        {/* WELLNESS LEGEND TOGGLE */}
                                        <div className="pl-8 md:pl-12 mb-8">
                                            <button
                                                onClick={() => setShowWellnessLegend(!showWellnessLegend)}
                                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-boxing-green hover:text-white transition-colors"
                                            >
                                                <Info className="w-4 h-4" />
                                                {showWellnessLegend ? "Ukryj Poradnik Oceny" : "Jak Oceniać Formę?"}
                                            </button>

                                            <AnimatePresence>
                                                {showWellnessLegend && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-4 bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="flex gap-3 items-start">
                                                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 flex-shrink-0">
                                                                    <Moon className="w-4 h-4 text-purple-400" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-white text-xs font-bold uppercase mb-1">Jakość Snu (1-10)</div>
                                                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                                                        <span className="text-purple-400">1</span> = Bezsenność, wybudzanie.<br />
                                                                        <span className="text-purple-400">10</span> = Głęboki, regenerujący sen bez przerw.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3 items-start">
                                                                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 flex-shrink-0">
                                                                    <Zap className="w-4 h-4 text-yellow-400" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-white text-xs font-bold uppercase mb-1">Energia (1-10)</div>
                                                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                                                        <span className="text-yellow-400">1</span> = Wyczerpanie, brak sił.<br />
                                                                        <span className="text-yellow-400">10</span> = Energia rozpiera, gotowość bojowa.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3 items-start">
                                                                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 flex-shrink-0">
                                                                    <Smile className="w-4 h-4 text-red-400" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-white text-xs font-bold uppercase mb-1">Stres (1-10)</div>
                                                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                                                        <span className="text-red-400">1</span> = Zen, pełny spokój.<br />
                                                                        <span className="text-red-400">10</span> = Panika, przytłoczenie, chaos.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3 items-start">
                                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                                                                    <AlertCircle className="w-4 h-4 text-blue-400" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-white text-xs font-bold uppercase mb-1">Bolesność (1-10)</div>
                                                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                                                        <span className="text-blue-400">1</span> = Brak bólu, świeżość.<br />
                                                                        <span className="text-blue-400">10</span> = Ból uniemożliwiający ruch.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {sessionHistory.map((entry, idx) => (
                                            <div key={entry.id} className="relative pl-8 md:pl-12">
                                                {/* Timeline Dot */}
                                                <div className="absolute -left-1.5 top-8 w-3 h-3 bg-zinc-800 rounded-full border border-white/20 group-hover:bg-boxing-neon group-hover:border-boxing-neon transition-colors"></div>

                                                <div className="bg-gradient-to-br from-[#111] to-black border-t border-white/10 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">

                                                    {/* Background Glow */}
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full group-hover:bg-boxing-green/5 transition-colors"></div>

                                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">{entry.date}</div>
                                                                {entry.wellness.energy >= 8 && <div className="text-[9px] font-bold text-yellow-500 uppercase flex items-center gap-1"><Zap className="w-3 h-3" /> Peak</div>}
                                                            </div>
                                                            <h3 className="text-xl font-bold text-white uppercase tracking-tight group-hover:text-boxing-neon transition-colors">{entry.title}</h3>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {entry.wellness.sleep <= 3 && <div className="w-2 h-2 rounded-full bg-red-500" title="Poor Sleep"></div>}
                                                            {entry.wellness.stress >= 8 && <div className="w-2 h-2 rounded-full bg-orange-500" title="High Stress"></div>}
                                                        </div>
                                                    </div>

                                                    {/* Wellness Grid - Metallic Pills */}
                                                    <div className="grid grid-cols-4 gap-2 mb-4 relative z-10">
                                                        {[
                                                            { l: 'Sen', v: entry.wellness.sleep, c: 'text-purple-300', b: 'border-purple-500/20 bg-purple-500/5' },
                                                            { l: 'Moc', v: entry.wellness.energy, c: 'text-yellow-300', b: 'border-yellow-500/20 bg-yellow-500/5' },
                                                            { l: 'Stres', v: entry.wellness.stress, c: 'text-red-300', b: 'border-red-500/20 bg-red-500/5' },
                                                            { l: 'Ból', v: entry.wellness.soreness, c: 'text-blue-300', b: 'border-blue-500/20 bg-blue-500/5' },
                                                        ].map((stat, i) => (
                                                            <div key={i} className={`rounded-xl py-2 px-1 text-center border ${stat.b}`}>
                                                                <div className={`text-lg font-bold ${stat.c}`}>{stat.v}</div>
                                                                <div className="text-[7px] text-gray-500 uppercase font-bold tracking-widest opacity-70">{stat.l}</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {entry.wellness.note && (
                                                        <div className="relative pl-4 border-l-2 border-white/10 text-sm text-gray-400 italic font-mono pt-1">
                                                            "{entry.wellness.note}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // ACTIVE UNIT VIEW
                            <div>
                                {/* Sticky Header */}
                                <div className="sticky top-4 z-40 bg-[#050505]/95 backdrop-blur border border-white/10 p-4 rounded-xl mb-8 flex justify-between items-center shadow-2xl">
                                    <button onClick={() => setViewUnitId(null)} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest">
                                        <ArrowLeft className="w-4 h-4" /> Wróć
                                    </button>
                                    <div className="text-white font-bold uppercase hidden sm:block">
                                        {schedule.flatMap(w => w.units).find(u => u.id === viewUnitId)?.title}
                                    </div>

                                    {getUnitStatus(viewUnitId) === 'ACTIVE' ? (
                                        <button onClick={triggerFinish} className="bg-boxing-green text-black px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2">
                                            <Save className="w-4 h-4" /> Zapisz Sesję
                                        </button>
                                    ) : (
                                        <div className="bg-zinc-900 text-gray-500 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                            <Eye className="w-4 h-4" /> Tryb Czytania
                                        </div>
                                    )}
                                </div>

                                {/* COACH TIPS (PREMIUM APPLE STYLE) */}
                                {schedule.flatMap(w => w.units).find(u => u.id === viewUnitId)?.data?.tips && (
                                    <div className="max-w-3xl mx-auto mb-12">
                                        <div className="flex items-center justify-center mb-6">
                                            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5 shadow-2xl">
                                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-boxing-green opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-boxing-green"></span>
                                                    </span>
                                                    Live Coach Feed
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {schedule.flatMap(w => w.units).find(u => u.id === viewUnitId).data.tips.map((tip, i) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    key={i}
                                                    className={`flex gap-4 items-end ${tip.type === 'coach' ? 'flex-row-reverse' : 'flex-row'}`}
                                                >
                                                    {/* Avatar */}
                                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border shadow-sm overflow-hidden
                                                        ${tip.type === 'coach' ? 'border-boxing-green text-boxing-green bg-black' : 'border-zinc-800 bg-zinc-900 text-gray-400'}
                                                    `}>
                                                        {tip.type === 'coach' && <User className="w-5 h-5" />}
                                                        {tip.type === 'science' && <Activity className="w-4 h-4" />}
                                                        {tip.type === 'alert' && <AlertCircle className="w-4 h-4" />}
                                                        {tip.type === 'info' && <Zap className="w-4 h-4" />}
                                                    </div>

                                                    {/* Bubble */}
                                                    <div className={`relative px-5 py-3 rounded-2xl max-w-md text-sm leading-relaxed shadow-sm
                                                        ${tip.type === 'coach'
                                                            ? 'bg-[#1c1c1e] text-white rounded-br-none border border-white/5'
                                                            : tip.type === 'alert'
                                                                ? 'bg-red-500/10 text-red-200 border border-red-500/20 rounded-bl-none'
                                                                : 'bg-[#2c2c2e] text-gray-200 rounded-bl-none border border-white/5'
                                                        }
                                                    `}>
                                                        {tip.text}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Content Grid */}
                                <div className="space-y-8 max-w-4xl mx-auto">
                                    {schedule.flatMap(w => w.units).find(u => u.id === viewUnitId)?.data.sections.map((section, idx) => (
                                        <div key={idx} className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden relative">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${section.color.replace('border-', 'bg-')}`}></div>
                                            <div className="p-4 border-b border-white/5 bg-zinc-900/20 pl-6">
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{section.title}</h3>
                                            </div>
                                            <div className="divide-y divide-white/5">
                                                {section.rows.map(row => (
                                                    <div key={row.id} className="p-5 pl-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                                                        <div className="flex-grow w-full sm:w-auto">
                                                            <div className="text-white font-bold text-sm mb-1">{row.exercise}</div>
                                                            <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 font-mono uppercase">
                                                                {row.sets && <span className="bg-zinc-900 px-2 py-1 rounded border border-white/5">{row.sets} Sets</span>}
                                                                {row.reps && <span className="bg-zinc-900 px-2 py-1 rounded border border-white/5">{row.reps}</span>}
                                                                {row.rest && <span className="bg-zinc-900 px-2 py-1 rounded border border-white/5">{row.rest} Rest</span>}
                                                                {row.load && <span className="bg-boxing-green/10 text-boxing-green px-2 py-1 rounded border border-boxing-green/20">{row.load}</span>}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                                                            {row.input && (
                                                                <input
                                                                    className="bg-[#050505] border border-white/10 rounded-lg w-20 py-2 text-center text-white text-sm focus:border-boxing-green focus:outline-none placeholder-zinc-700"
                                                                    placeholder={row.unit || "kg"}
                                                                    disabled={getUnitStatus(viewUnitId) !== 'ACTIVE'}
                                                                    value={inputs[row.id] || ''}
                                                                    onChange={(e) => setInputs({ ...inputs, [row.id]: e.target.value })}
                                                                />
                                                            )}
                                                            <button
                                                                onClick={() => setCheckboxes({ ...checkboxes, [row.id]: !checkboxes[row.id] })}
                                                                disabled={getUnitStatus(viewUnitId) !== 'ACTIVE'}
                                                                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all
                                                                    ${checkboxes[row.id] ? 'bg-boxing-green border-boxing-green text-black' : 'border-zinc-800 text-zinc-600 hover:border-zinc-500'}
                                                                `}
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- WELLNESS SURVEY MODAL --- */}
            <AnimatePresence>
                {showWellnessModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] w-full max-w-lg p-8 rounded-3xl border border-zinc-700 max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-black text-white uppercase italic mb-2">Raport Pomeczowy</h3>
                                <p className="text-gray-500 text-xs uppercase tracking-widest">Jak twoja forma dzisiaj?</p>
                            </div>

                            <div className="space-y-2">
                                <SurveySlider icon={Moon} label="Jakość Snu" value={wellnessData.sleep} onChange={(v) => setWellnessData({ ...wellnessData, sleep: v })} />
                                <SurveySlider icon={Zap} label="Poziom Energii" value={wellnessData.energy} onChange={(v) => setWellnessData({ ...wellnessData, energy: v })} />
                                <SurveySlider icon={AlertCircle} label="Bolesność Mięśni" value={wellnessData.soreness} onChange={(v) => setWellnessData({ ...wellnessData, soreness: v })} />
                                <SurveySlider icon={Smile} label="Poziom Stresu" value={wellnessData.stress} onChange={(v) => setWellnessData({ ...wellnessData, stress: v })} />
                            </div>

                            <div className="mt-8 mb-8">
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Notatki Treningowe</label>
                                <textarea
                                    className="w-full bg-black border border-zinc-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-boxing-green h-24 resize-none"
                                    placeholder="Co poszło dobrze? Co do poprawy?"
                                    value={wellnessData.note}
                                    onChange={(e) => setWellnessData({ ...wellnessData, note: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setShowWellnessModal(false)} className="flex-1 py-4 bg-zinc-900 text-gray-400 font-bold uppercase text-xs rounded-xl hover:bg-zinc-800 transition-colors">Anuluj</button>
                                <button onClick={saveSession} className="flex-1 py-4 bg-boxing-green text-black font-bold uppercase text-xs rounded-xl hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,255,0,0.3)]">
                                    Zapisz do Dziennika
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* --- SHARE MODAL (INSTAGRAM STORY STYLE) --- */}
            <AnimatePresence>
                {showShareModal && shareData && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={() => setShowShareModal(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative w-full max-w-sm aspect-[9/16] bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col items-center text-center p-8 select-none cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Background Effects */}
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-boxing-neon/20 blur-[80px] rounded-full"></div>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col h-full w-full">
                                <div className="flex justify-between items-center mb-12">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-boxing-neon text-black flex items-center justify-center font-black italic rounded">B</div>
                                        <span className="text-white font-bold uppercase tracking-widest text-xs">Boxing24 Elite</span>
                                    </div>
                                    <div className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-mono border border-white/10">
                                        {shareData.date}
                                    </div>
                                </div>

                                <div className="flex-grow flex flex-col justify-center items-center gap-6">
                                    <h2 className="text-4xl font-black text-white italic uppercase leading-none drop-shadow-lg">
                                        Trening<br /><span className="text-boxing-neon">Ukończony</span>
                                    </h2>

                                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full">
                                        <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Misja</div>
                                        <div className="text-xl font-bold text-white mb-4">{shareData.title}</div>

                                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                                            <div>
                                                <div className="text-2xl font-black text-white">{shareData.stats?.strength || stats.strength}</div>
                                                <div className="text-[8px] text-gray-500 uppercase font-bold">Siła</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-black text-boxing-neon">+150</div>
                                                <div className="text-[8px] text-gray-500 uppercase font-bold">XP Gain</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-black text-white">{shareData.stats?.discipline || stats.discipline}</div>
                                                <div className="text-[8px] text-gray-500 uppercase font-bold">Passa</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-8">
                                    <div className="inline-block px-6 py-3 bg-boxing-neon text-black font-black uppercase text-xs tracking-widest rounded-full transform -rotate-2 shadow-[0_0_20px_rgba(204,255,0,0.5)]">
                                        #ElitePerformance
                                    </div>
                                    <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-6">Zrób zrzut ekranu i udostępnij</p>
                                </div>
                            </div>
                        </motion.div>

                        <button className="absolute top-8 right-8 text-white/50 hover:text-white" onClick={() => setShowShareModal(false)}>
                            <X className="w-8 h-8" />
                        </button>
                    </div>
                )}
            </AnimatePresence>



            {/* NEW ADVANCED ASSESSMENT MODAL */}
            {showAssessmentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-[#050505] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        {/* HEADER */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
                            <div>
                                <div className="text-[10px] text-boxing-green font-bold uppercase tracking-widest mb-1">Centrum Diagnostyczne</div>
                                <h2 className="text-2xl font-black text-white uppercase italic">Test Sprawności</h2>
                            </div>
                            <button onClick={closeAssessment} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
                        </div>

                        {/* CONTENT */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow">

                            {/* PHASE 1: LEVEL SELECTION */}
                            {!assessmentLevel && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                                    <button
                                        onClick={() => startAssessment('BASIC')}
                                        className="bg-gradient-to-br from-zinc-800 to-black p-8 rounded-3xl border border-white/10 hover:border-boxing-green/50 hover:from-zinc-700 transition-all group text-left relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full group-hover:bg-boxing-green/10 transition-colors"></div>
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-boxing-green group-hover:text-black transition-colors">
                                                <Activity className="w-6 h-6 text-white group-hover:text-black" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">Basic (Home)</h3>
                                            <p className="text-sm text-gray-400 mb-4">Idealny na start. Nie wymaga sprzętu. Wykonasz go w domu w 15 minut.</p>
                                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-t border-white/5 pt-4">
                                                4 Ćwiczenia &bull; Instrukcje Wideo
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => startAssessment('ADVANCED')}
                                        className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-3xl border border-white/10 hover:border-blue-500/50 hover:from-zinc-800 transition-all group text-left relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full group-hover:bg-blue-500/10 transition-colors"></div>
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                <Dumbbell className="w-6 h-6 text-blue-400 group-hover:text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">Advanced (Pro)</h3>
                                            <p className="text-sm text-gray-400 mb-4">Pełna diagnostyka sportowa. Wymaga dostępu do siłowni (drążek, ciężary).</p>
                                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-t border-white/5 pt-4">
                                                8 Ćwiczeń &bull; Analiza Asymetrii
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* PHASE 2: WIZARD */}
                            {assessmentLevel && !assessmentResult && (
                                <div className="animate-in slide-in-from-right duration-300">
                                    {(() => {
                                        const testStructure = assessmentLevel === 'BASIC' ? BASIC_TEST : ADVANCED_TEST;
                                        const category = testStructure[currentStep];
                                        const catMeta = Object.values(FITNESS_CATEGORIES).find(c => c.id === category.categoryId);

                                        return (
                                            <div>
                                                {/* Categories Progress */}
                                                <div className="flex gap-2 mb-8">
                                                    {testStructure.map((cat, idx) => (
                                                        <div key={idx} className={`h-1 flex-1 rounded-full transition-colors ${idx <= currentStep ? catMeta?.bg || 'bg-white' : 'bg-zinc-800'}`}></div>
                                                    ))}
                                                </div>

                                                <div className="mb-8">
                                                    <h3 className={`text-sm font-bold uppercase tracking-widest mb-1 ${catMeta?.color}`}>{catMeta?.title}</h3>
                                                    <h4 className="text-3xl font-black text-white uppercase italic">Krok {currentStep + 1}/{testStructure.length}</h4>
                                                </div>

                                                <div className="space-y-8">
                                                    {category.exercises.map(exercise => (
                                                        <div key={exercise.id} className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div>
                                                                    <div className="text-lg font-bold text-white mb-1">{exercise.title}</div>
                                                                    <div className="text-xs text-gray-500 leading-relaxed max-w-md">{exercise.instruction}</div>
                                                                </div>
                                                                {exercise.isAsymmetric && (
                                                                    <div className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-1 rounded uppercase border border-orange-500/20">
                                                                        Asymetria
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                                {exercise.isAsymmetric ? (
                                                                    <>
                                                                        <div>
                                                                            <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Lewa Strona ({exercise.unit})</label>
                                                                            <input
                                                                                type="number" inputMode="decimal"
                                                                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-center font-mono focus:border-boxing-green focus:outline-none"
                                                                                placeholder="0"
                                                                                value={assessmentInputs[`${exercise.id}_l`] || ''}
                                                                                onChange={e => handleAssessmentInput(`${exercise.id}_l`, e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Prawa Strona ({exercise.unit})</label>
                                                                            <input
                                                                                type="number" inputMode="decimal"
                                                                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-center font-mono focus:border-boxing-green focus:outline-none"
                                                                                placeholder="0"
                                                                                value={assessmentInputs[`${exercise.id}_r`] || ''}
                                                                                onChange={e => handleAssessmentInput(`${exercise.id}_r`, e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="col-span-2">
                                                                        <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Wynik ({exercise.unit})</label>
                                                                        <input
                                                                            type="number" inputMode="decimal"
                                                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-center font-mono focus:border-boxing-green focus:outline-none"
                                                                            placeholder="0"
                                                                            value={assessmentInputs[exercise.id] || ''}
                                                                            onChange={e => handleAssessmentInput(exercise.id, e.target.value)}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* PHASE 3: RESULTS */}
                            {assessmentResult && (
                                <div className="animate-in zoom-in-95 duration-500 text-center">
                                    <div className="mb-8 relative inline-block">
                                        <div className="absolute inset-0 bg-boxing-green/20 blur-[60px] rounded-full"></div>

                                        {/* Score Circle (Simple) */}
                                        <div className="w-56 h-56 mx-auto relative z-10 flex items-center justify-center bg-black rounded-full border-4 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                                            <div className="absolute inset-0 rounded-full border border-white/10"></div>
                                            <div className="absolute inset-2 rounded-full border border-white/5 border-dashed animate-spin-slow"></div>

                                            <div className="flex flex-col items-center justify-center">
                                                <div className="text-7xl font-black text-white tracking-tighter" style={{ textShadow: '0 0 30px rgba(255,255,255,0.2)' }}>
                                                    {assessmentResult.globalScore}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase text-boxing-green tracking-widest mt-2 bg-boxing-green/10 px-3 py-1 rounded-full border border-boxing-green/20">
                                                    Global Score
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                        {Object.entries(assessmentResult.categoryScores).map(([catId, score]) => {
                                            const catMeta = Object.values(FITNESS_CATEGORIES).find(c => c.id === catId);
                                            return (
                                                <div key={catId} className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl">
                                                    <div className={`text-2xl font-bold mb-1 ${catMeta?.color}`}>{score}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{catMeta?.title}</div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {assessmentResult.asymmetries.length > 0 && (
                                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8 text-left">
                                            <div className="flex items-center gap-2 text-red-400 font-bold uppercase text-xs tracking-widest mb-2">
                                                <AlertCircle className="w-4 h-4" /> Wykryto dysbalans (&gt;15%)
                                            </div>
                                            <ul className="text-sm text-gray-300 space-y-1">
                                                {assessmentResult.asymmetries.map((a, i) => (
                                                    <li key={i}>&bull; {a.exercise} (Kara -{a.penalty} pkt)</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="p-6 bg-zinc-900 border border-white/5 rounded-2xl mb-8">
                                        <h4 className="text-white font-bold uppercase mb-2">Profil Zawodnika</h4>
                                        <p className="text-sm text-gray-400">
                                            Twój wynik sugeruje, że jesteś gotowy do dalszej pracy.
                                            {assessmentResult.globalScore > 75 ? " Doskonała baza! Czas na specjalizację." : " Skup się na poprawie słabych ogniw (patrz wykres)."}
                                        </p>
                                    </div>

                                </div>
                            )}

                        </div>

                        {/* FOOTER ACTIONS */}
                        <div className="p-6 border-t border-white/5 bg-zinc-900/20 flex justify-between">
                            {assessmentLevel && !assessmentResult && (
                                <>
                                    <button
                                        onClick={prevAssessmentStep}
                                        className="text-gray-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Wstecz
                                    </button>
                                    <button
                                        onClick={nextAssessmentStep}
                                        className="bg-boxing-green text-black px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-white transition-colors shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                                    >
                                        {currentStep === (assessmentLevel === 'BASIC' ? BASIC_TEST : ADVANCED_TEST).length - 1 ? 'Zakończ Test' : 'Dalej'}
                                    </button>
                                </>
                            )}
                            {assessmentResult && (
                                <div className="w-full flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-3 mb-2">
                                        <button
                                            onClick={() => downloadSocialCard('square')}
                                            disabled={isDownloading}
                                            className="flex items-center justify-center gap-2 bg-zinc-800 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-zinc-700 transition-colors border border-white/10"
                                        >
                                            <Share2 className="w-4 h-4" /> Insta Post (1:1)
                                        </button>
                                        <button
                                            onClick={() => downloadSocialCard('story')}
                                            disabled={isDownloading}
                                            className="flex items-center justify-center gap-2 bg-zinc-800 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-zinc-700 transition-colors border border-white/10"
                                        >
                                            <Share2 className="w-4 h-4" /> Insta Story (9:16)
                                        </button>
                                    </div>
                                    <button onClick={closeAssessment} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-boxing-neon transition-colors">
                                        Zapisz Wynik i Zamknij
                                    </button>

                                    {/* Hidden Render Containers for Screenshots */}
                                    {assessmentResult && (
                                        <div className="fixed left-[9999px] top-0 pointer-events-none">
                                            <div id="social-card-square">
                                                <SocialMediaCard result={assessmentResult} format="square" userName="Zawodnik" />
                                            </div>
                                            <div id="social-card-story">
                                                <SocialMediaCard result={assessmentResult} format="story" userName="Zawodnik" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};



export default MemberPage;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Calendar,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    TrendingUp,
    Clock,
    Zap,
    Trophy,
    Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClientData } from '../hooks/useClientData';

const PremiumSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, profile } = useAuth();
    const { bookings, gamification, plans, allPlans, loading } = useClientData();

    if (!user) return null;

    // Logic to find the next session
    const nextSession = bookings?.upcoming?.[0];
    const activePlanId = plans?.[0];
    const currentPlan = allPlans.find(p => p.id == activePlanId);

    return (
        <div className="fixed right-0 top-0 h-screen z-[60] flex items-center">
            {/* Trigger Button – Premium Dark */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`absolute right-0 z-[70] bg-zinc-900/80 backdrop-blur-xl border-y border-l border-white/[0.08] p-2 rounded-l-xl transition-all hover:bg-white/5 hover:border-red-500/20 group ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0'}`}
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                whileHover={{ x: -5 }}
            >
                <div className="flex flex-col items-center gap-4 py-4">
                    <ChevronLeft className="w-5 h-5 text-red-500 group-hover:text-red-400" />
                    <div className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500 group-hover:text-white transition-colors">
                        STREFA PREMIUM
                    </div>
                </div>
            </motion.button>

            {/* Main Sidebar Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for mobile */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            className="relative h-[95vh] w-[320px] md:w-[380px] bg-zinc-950/90 backdrop-blur-3xl border-l border-white/[0.08] shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex flex-col mr-2 rounded-l-3xl overflow-hidden"
                        >
                            {/* Panel Header */}
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-600/10 rounded-lg border border-red-500/20">
                                        <Zap className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="text-white font-black text-xs tracking-wider uppercase truncate">System Aktywny</h3>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest truncate">{profile?.full_name || user?.email?.split('@')[0]}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500 hover:text-white"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Widgets Container */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
                                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Synchronizacja danych...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* WIDGET: Schedule (Harmonogram) */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Najbliższy Trening</span>
                                                <Calendar className="w-4 h-4 text-zinc-600" />
                                            </div>

                                            {nextSession ? (
                                                <Link to="/members">
                                                    <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl group hover:bg-white/[0.05] hover:border-red-500/20 transition-all cursor-pointer relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)]" />
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <h4 className="text-white font-bold text-lg mb-1 italic">
                                                                    {new Date(nextSession.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </h4>
                                                                <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">{nextSession.coach_name}</p>
                                                            </div>
                                                            <Clock className="w-5 h-5 text-red-500/50" />
                                                        </div>
                                                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                                            <Target className="w-3 h-3" />
                                                            {new Date(nextSession.start_time).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="bg-white/[0.01] border border-dashed border-white/10 p-5 rounded-2xl text-center">
                                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Brak rezerwacji</p>
                                                    <Link to="/booking" className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 block hover:underline">Zarezerwuj teraz</Link>
                                                </div>
                                            )}
                                        </div>

                                        {/* WIDGET: Biometrics / Gamification */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-red-500/20 transition-all">
                                                <Trophy className="w-5 h-5 text-amber-500" />
                                                <div className="text-center">
                                                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Poziom</span>
                                                    <span className="text-2xl font-black text-white italic">{gamification?.level || 1}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-red-500/20 transition-all">
                                                <div className="relative w-10 h-10 flex items-center justify-center">
                                                    <svg className="w-full h-full -rotate-90">
                                                        <circle cx="20" cy="20" r="18" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                                        <motion.circle
                                                            cx="20" cy="20" r="18" fill="transparent" stroke="#ef4444" strokeWidth="3" strokeDasharray="113"
                                                            initial={{ strokeDashoffset: 113 }}
                                                            animate={{ strokeDashoffset: 113 - (113 * (gamification?.currentLevelXp / gamification?.nextLevelXp)) }}
                                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                                        />
                                                    </svg>
                                                    <Activity className="absolute w-4 h-4 text-red-500" />
                                                </div>
                                                <div className="text-center">
                                                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Postęp</span>
                                                    <span className="text-[10px] font-black text-white uppercase italic">{gamification?.currentLevelXp}/{gamification?.nextLevelXp} XP</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* WIDGET: Your Active Plan */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Twój Program</span>
                                                <BookOpen className="w-4 h-4 text-zinc-600" />
                                            </div>

                                            {currentPlan ? (
                                                <Link to="/members" className="block p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-red-500/20 transition-all group">
                                                    <h5 className="text-white font-black text-sm uppercase italic group-hover:text-red-400 transition-colors">{currentPlan.title}</h5>
                                                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Poziom: {currentPlan.level}</p>

                                                    <div className="mt-4 flex items-center gap-2">
                                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-red-500 w-[30%]" />
                                                        </div>
                                                        <span className="text-[9px] font-black text-zinc-500">30%</span>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="bg-white/[0.01] border border-dashed border-white/10 p-5 rounded-2xl text-center">
                                                    <Link to="/knowledge" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Wybierz plan treningowy</Link>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                            </div>

                            {/* Panel Footer / Quick Action */}
                            <div className="p-6 bg-white/[0.02] border-t border-white/5">
                                <Link to="/members">
                                    <button className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-2">
                                        <LayoutGrid className="w-4 h-4" />
                                        TWÓJ PULPIT
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PremiumSidebar;

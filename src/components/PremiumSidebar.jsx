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
    Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PremiumSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, profile } = useAuth();

    if (!user) return null;

    return (
        <div className="fixed right-0 top-0 h-screen z-[60] flex items-center">
            {/* Trigger Button - Floating on the edge */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`absolute right-0 z-[70] bg-black/40 backdrop-blur-md border-y border-l border-white/10 p-2 rounded-l-xl transition-all hover:bg-white/5 group ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0'}`}
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                whileHover={{ x: -5 }}
            >
                <div className="flex flex-col items-center gap-4 py-4">
                    <ChevronLeft className="w-5 h-5 text-boxing-green animate-pulse" />
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
                            className="relative h-[95vh] w-[320px] md:w-[380px] bg-black/60 backdrop-blur-3xl border-l border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex flex-col mr-2 rounded-l-3xl overflow-hidden"
                        >
                            {/* Panel Header */}
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-boxing-green/10 rounded-lg border border-boxing-green/20">
                                        <Zap className="w-5 h-5 text-boxing-green" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-sm tracking-wider uppercase">System Aktywny</h3>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{profile?.full_name || 'Użytkownik'}</p>
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

                                {/* WIDGET: Schedule (Harmonogram) */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Harmonogram</span>
                                        <Calendar className="w-4 h-4 text-zinc-600" />
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl group hover:bg-white/[0.05] transition-all cursor-pointer relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-boxing-green" />
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="text-white font-bold text-lg mb-1 italic">Następna sesja: 18:00</h4>
                                                <p className="text-zinc-400 text-xs">Trening Siłowy / Technika</p>
                                            </div>
                                            <Clock className="w-5 h-5 text-boxing-green opacity-50" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                                                <span>PROGRES DNIA</span>
                                                <span className="text-boxing-green">65%</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '65%' }}
                                                    className="h-full bg-boxing-green shadow-[0_0_10px_#ccff00]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* WIDGET: Biometrics (Tętno) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-red-500/30 transition-all">
                                        <Activity className="w-5 h-5 text-red-500 animate-[pulse_1s_infinite]" />
                                        <div className="text-center">
                                            <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tętno</span>
                                            <span className="text-2xl font-black text-white italic">145 <span className="text-[10px] not-italic text-zinc-500">BPM</span></span>
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-boxing-green/30 transition-all">
                                        <TrendingUp className="w-5 h-5 text-boxing-green" />
                                        <div className="text-center">
                                            <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Wydajność</span>
                                            <span className="text-2xl font-black text-white italic">A+</span>
                                        </div>
                                    </div>
                                </div>

                                {/* WIDGET: Plan Library (Biblioteka) */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Biblioteka Planów</span>
                                        <Link to="/membership" className="text-[10px] font-black text-boxing-green uppercase tracking-[0.2em] hover:brightness-125 transition-all">WSZYSTKIE</Link>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { name: 'Fundamentals 101', level: 'Początkujący' },
                                            { name: 'Power & Explosiveness', level: 'Zaawansowany' }
                                        ].map((plan, i) => (
                                            <Link
                                                key={plan.name}
                                                to="/membership"
                                                className="block p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h5 className="text-white font-bold text-xs group-hover:text-boxing-green transition-colors">{plan.name}</h5>
                                                        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">{plan.level}</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* Panel Footer / Quick Action */}
                            <div className="p-6 bg-white/[0.02] border-t border-white/5">
                                <Link to="/members">
                                    <button className="w-full bg-boxing-green text-black py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#bbe000] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all flex items-center justify-center gap-2">
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

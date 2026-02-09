import React from 'react';
import { motion } from 'framer-motion';
import HeroCarousel from '../components/HeroCarousel';
import { ArrowRight, Star, Trophy, Users, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TickerTape = () => {
    return (
        <div className="bg-boxing-green text-black py-3 overflow-hidden border-y border-black/10">
            <div className="flex whitespace-nowrap animate-marquee">
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="mx-8 font-black uppercase text-sm tracking-widest flex items-center gap-4">
                        Boxing24 Elite Performance <Star className="w-3 h-3 fill-black" />
                        Data Driven <Star className="w-3 h-3 fill-black" />
                        Fight Science <Star className="w-3 h-3 fill-black" />
                    </span>
                ))}
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, value, label }) => (
    <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 backdrop-blur hover:border-boxing-green/30 transition-all group">
        <Icon className="w-8 h-8 text-boxing-green mb-4 group-hover:scale-110 transition-transform" />
        <div className="text-4xl font-black text-white mb-2">{value}</div>
        <div className="text-xs text-gray-500 uppercase tracking-widest">{label}</div>
    </div>
);

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full bg-black min-h-screen">
            {/* 1. HERO CAROUSEL */}
            <HeroCarousel />

            {/* 2. TICKER */}
            <TickerTape />

            {/* 3. METHODOLOGY SECTION */}
            <section className="py-32 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-dotted-pattern opacity-10 pointer-events-none" />

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <span className="text-boxing-green font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Filozofia B24</span>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-8 leading-none">
                            Nie zgaduj.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Trenuj na danych.</span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
                            Boks to szachy, gdzie figury poruszają się z prędkością 10m/s. W Boxing24 łączymy oldschoolową etykę pracy z najnowszą technologią analizy sportowej. Tworzymy atletów kompletnych.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <StatCard icon={Trophy} value="12+" label="Mistrzów Polski" />
                            <StatCard icon={Users} value="500+" label="Podopiecznych" />
                            <StatCard icon={Activity} value="100%" label="Data Driven" />
                            <StatCard icon={Star} value="4.9" label="Średnia Ocen" />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 relative group">
                            <img
                                src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1974&auto=format&fit=crop"
                                alt="Boxing Training"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="text-white font-bold text-xl mb-2">Trening Personalny</div>
                                <p className="text-sm text-gray-400 mb-4">Indywidualne podejście, analiza wideo, korekta techniki w czasie rzeczywistym.</p>
                                <button onClick={() => navigate('/booking')} className="text-boxing-green text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                                    Sprawdź Terminy <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Decorative Circle */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-boxing-green/20 rounded-full blur-3xl" />
                    </div>
                </div>
            </section>

            {/* 4. CALL TO ACTION */}
            <section className="py-32 px-4 border-t border-white/5 bg-[#050505] text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter mb-8 text-stroke-white opacity-20">
                        READY TO FIGHT?
                    </h2>
                    <h3 className="text-3xl font-bold text-white mb-8">Dołącz do społeczności Boxing24</h3>
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <button onClick={() => navigate('/booking')} className="px-10 py-5 bg-boxing-green text-black font-black uppercase tracking-widest hover:scale-105 transition-transform">
                            Zarezerwuj Trening
                        </button>
                        <button onClick={() => navigate('/membership')} className="px-10 py-5 border border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/5 transition-colors">
                            Aplikacja Online
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;

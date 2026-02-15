import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Layers, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero3D = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // Fallback safe scrolling
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#050505]">

            {/* 1. BACKGROUND */}
            <motion.div
                style={{ y: yBackground, scale }}
                className="absolute inset-0 z-0"
            >
                {/* Dark noise/gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-black to-[#050505]"></div>

                {/* Glow Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-600/10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-900/20 blur-[100px] rounded-full"></div>

                {/* Grid */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            </motion.div>

            {/* 2. CONTENT */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">

                {/* TEXT LAYER */}
                <motion.div style={{ opacity: opacityText }} className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-sm md:text-xl font-bold text-red-500 uppercase tracking-[0.5em] mb-6">
                            Pasja • Technika • Społeczność
                        </h2>
                    </motion.div>

                    <h1 className="text-6xl md:text-9xl font-black text-white leading-tight tracking-tighter mb-8">
                        BOXING<span className="text-red-500">24</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    Przestrzeń, gdzie biomechanika spotyka technologię.
                    <br className="hidden md:block" /> Kompletny ekosystem dla Twojego rozwoju.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                >
                    <button
                        onClick={() => navigate('/membership')}
                        className="bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        Zacznij tutaj <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => navigate('/members')}
                        className="text-gray-400 hover:text-white px-8 py-4 font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        <Play className="w-5 h-5" /> Demo Systemu
                    </button>
                </motion.div>


                {/* 3. DECORATIVE ELEMENTS (Desktop Only) */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute top-1/3 left-10 hidden xl:block"
                >
                    <div className="glass-panel p-4 rounded-xl flex items-center gap-4 w-64 backdrop-blur-sm transform -rotate-6 border border-red-500/20">
                        <Layers className="text-red-500 w-8 h-8" />
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">System Szkoleniowy</div>
                            <div className="text-white font-bold text-lg leading-tight">Sport & Nauka <span className="text-xs text-red-400 ml-1">PRO</span></div>
                        </div>
                    </div>
                </motion.div>

                {/* 4. CPU ICON -> DATA METRICS */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="absolute bottom-1/3 right-10 hidden xl:block"
                >
                    <div className="glass-panel p-4 rounded-xl flex items-center gap-4 w-64 backdrop-blur-sm transform rotate-6 border border-blue-500/20">
                        <TrendingUp className="text-blue-500 w-8 h-8" />
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Twoja Podróż</div>
                            <div className="text-white font-bold text-lg leading-tight">Zacznij Dzisiaj <span className="text-xs text-blue-400 ml-1">START</span></div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div >
    );
};

export default Hero3D;

import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-boxing-green/20 rounded-full blur-3xl opacity-30 mix-blend-screen"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-boxing-green/10 rounded-full blur-3xl opacity-20 mix-blend-screen"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="block text-boxing-green font-bold tracking-[0.3em] uppercase mb-6 text-sm md:text-base">
                        Elite Performance for Leaders
                    </span>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white italic leading-tight mb-8 tracking-wide">
                        SYSTEM TRENINGOWY<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                            DLA TYCH, KTÓRZY WYMAGAJĄ OD SIEBIE WIĘCEJ.
                        </span>
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                        Optymalizacja Wydajności. Elite Performance dla Liderów.<br />
                        Ekskluzywny coaching bokserski we Wrocławiu.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <button className="px-10 py-4 bg-boxing-green text-white font-bold tracking-widest uppercase hover:bg-green-800 transition-all clip-path-slant">
                            Rozpocznij Proces
                        </button>
                        <button className="px-10 py-4 border border-white/20 text-white font-bold tracking-widest uppercase hover:bg-white/5 transition-all">
                            Poznaj Metodologię
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-boxing-green to-transparent"></div>
            </motion.div>
        </section>
    );
};

export default Hero;

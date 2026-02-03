import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Clock, Shield } from 'lucide-react';

const VIPSection = () => {
    return (
        <section className="py-32 px-4 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-boxing-green/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Content Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center space-x-2 text-boxing-green mb-6">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="uppercase tracking-[0.2em] text-sm font-bold">Concierge Service</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                            Private Executive <br />
                            <span className="text-boxing-gold">Training Protocol.</span>
                        </h2>

                        <p className="text-gray-400 text-lg leading-relaxed mb-10 border-l-2 border-boxing-gold pl-6">
                            Twoje 60 minut jest warte więcej niż karnet w sieciówce.
                            Dostarczam kompletne zaplecze treningowe pod Twoje drzwi.
                            Maksymalizacja ROI Twojego czasu.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                            {[
                                { icon: Clock, text: 'Zero korków. Zero stresu.' },
                                { icon: Shield, text: '100% Dyskrecji i Prywatności.' },
                                { icon: Check, text: 'Pełna elastyczność czasowa.' },
                                { icon: Star, text: 'Sprzęt Premium w cenie.' }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center space-x-4 bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/5">
                                    <item.icon className="w-6 h-6 text-boxing-gold" />
                                    <span className="text-gray-300 font-medium">{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gradient-to-r from-boxing-green/10 to-transparent p-8 border-l-4 border-boxing-green backdrop-blur-md">
                            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                                <div>
                                    <div className="text-sm text-boxing-green font-bold tracking-widest uppercase mb-1">Inwestycja</div>
                                    <div className="text-4xl font-black text-white">250 PLN <span className="text-sm font-normal text-gray-400">/ 60 min</span></div>
                                </div>
                                <div className="text-right">
                                    <div className="text-red-500 font-bold text-sm uppercase tracking-widest flex items-center justify-end gap-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                        Dostępność limitowana
                                    </div>
                                    <div className="text-gray-400 text-xs mt-1">Tylko 3 wolne sloty w tym miesiącu</div>
                                </div>
                            </div>
                        </div>

                    </motion.div>

                    {/* Visual Side - Glassmorphism Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative z-10 bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl">
                            <div className="aspect-[4/5] bg-zinc-950 rounded-xl relative overflow-hidden flex items-center justify-center border border-white/5">
                                <div className="absolute inset-0 bg-gradient-to-br from-boxing-green/20 via-transparent to-transparent opacity-50"></div>
                                {/* Abstract Graphic */}
                                <div className="relative z-10 w-full h-full p-8 flex flex-col justify-between">
                                    <div className="w-16 h-1 w-boxing-green bg-boxing-green/50"></div>
                                    <div className="text-center">
                                        <h3 className="text-7xl font-black text-white/5 tracking-tighter">ELITE</h3>
                                        <h3 className="text-7xl font-black text-white/5 tracking-tighter -mt-4">VIP</h3>
                                    </div>
                                    <div className="flex justify-end">
                                        <div className="w-16 h-1 w-boxing-green bg-boxing-green/50"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-boxing-green/20 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default VIPSection;

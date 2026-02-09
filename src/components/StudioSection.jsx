import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Brain, Globe, ArrowRight } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, desc, price, highlight = false }) => (
    <div className={`
        relative p-8 rounded-xl backdrop-blur-md border transition-all duration-300 group
        ${highlight
            ? 'bg-boxing-green/10 border-boxing-green/30 hover:bg-boxing-green/20'
            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}
    `}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>

        <Icon className={`w-10 h-10 mb-6 ${highlight ? 'text-white' : 'text-boxing-green'} transition-transform group-hover:scale-110`} />

        <h3 className="text-xl font-bold text-white mb-4 tracking-wide">{title}</h3>
        <p className="text-gray-400 mb-8 leading-relaxed text-sm min-h-[80px]">{desc}</p>

        <div className="flex items-center justify-between mt-auto">
            {price && <div className="text-lg font-bold text-white">{price}</div>}
            <ArrowRight className={`w-5 h-5 ${highlight ? 'text-white' : 'text-boxing-green'} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all`} />
        </div>
    </div>
);

const StudioSection = () => {
    return (
        <section className="py-24 px-4 relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Metodyka & Współpraca</h2>
                    <div className="w-24 h-1 bg-boxing-green mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={MapPin}
                        title="Trening Stacjonarny"
                        desc="Profesjonalny trening w WUEF Studio. Dostęp do pełnego zaplecza treningowego, worków, ringu i strefy siłowej. Atmosfera pracy i skupienia."
                        price="170 PLN"
                    />

                    <FeatureCard
                        icon={Globe}
                        title="Mentoring Online 24/7"
                        desc="Twój Mentor boksu dostępny 24/7. Analiza techniki wideo, stały kontakt i dedykowana strategia rozwoju. Prowadzenie zawodnicze na odległość."
                        price="Indywidualnie"
                        highlight={true}
                    />

                    <FeatureCard
                        icon={Brain}
                        title="Nauka, nie Bro-Science"
                        desc="Fundamenty Naukowe. Programujemy sukces w oparciu o biomechanikę, fizjologię i analizę neuro-motoryczną. Zero mitów, czysta efektywność."
                        price=""
                    />
                </div>
            </div>
        </section>
    );
};

export default StudioSection;

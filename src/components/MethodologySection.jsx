import React from 'react';
import { motion } from 'framer-motion';
import { Target, Activity, Zap } from 'lucide-react';

const MethodologyCard = ({ icon: Icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="bg-zinc-900 border border-zinc-800 p-10 hover:border-boxing-green/50 transition-colors group"
    >
        <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center mb-8 group-hover:bg-boxing-green/20 transition-colors">
            <Icon className="w-8 h-8 text-white group-hover:text-boxing-green transition-colors" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
    </motion.div>
);

const MethodologySection = () => {
    return (
        <section className="py-24 px-4 bg-zinc-950 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-boxing-green font-bold tracking-widest uppercase text-sm mb-2 block">Filozofia</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Metodologia Elite</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-zinc-800 border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">
                    <MethodologyCard
                        icon={Target}
                        title="Precyzja Ruchu"
                        desc="Eliminacja zbędnych napięć. Optymalizacja wektorów siły. Boks to geometria bólu i balet uników. Uczymy Cię poruszać się z chirurgiczną precyzją."
                        delay={0.1}
                    />
                    <MethodologyCard
                        icon={Zap}
                        title="Regeneracja Neurologiczna"
                        desc="Trening to bodziec. Wzrost następuje podczas regeneracji. Skupiamy się na układzie nerwowym, abyś był zawsze gotowy do działania na 100%."
                        delay={0.2}
                    />
                    <MethodologyCard
                        icon={Activity}
                        title="Wydajność Posturalna"
                        desc="Fundament każdego ciosu. Praca nad taśmami powięziowymi i stabilizacją. Budujemy ciało, które jest bronią, a nie obciążeniem."
                        delay={0.3}
                    />
                </div>
            </div>
        </section>
    );
};

export default MethodologySection;

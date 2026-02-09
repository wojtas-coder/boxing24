import React from 'react';
import { Trophy } from 'lucide-react';

const FightPrepSection = () => {
    return (
        <section className="py-24 px-4 relative bg-black overflow-hidden group">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center bg-fixed mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

            <div className="relative z-10 max-w-5xl mx-auto text-center">
                <Trophy className="w-16 h-16 text-boxing-green mx-auto mb-8" />

                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
                    Fight Camp Protocol
                </h2>

                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 font-light">
                    Twoja droga do ringu. Profesjonalny narożnik i kompletny proces Fight Camp.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                    <div className="bg-zinc-900/80 backdrop-blur-md p-8 border border-white/10 rounded-lg">
                        <h4 className="text-boxing-green font-bold uppercase tracking-wider mb-4">Fight Camp</h4>
                        <p className="text-sm text-gray-400">
                            8-12 tygodniowy cykl przygotowawczy. Periodyzacja treningowa, sparingi zadaniowe, strategia walki pod konkretnego przeciwnika.
                        </p>
                    </div>
                    <div className="bg-zinc-900/80 backdrop-blur-md p-8 border border-white/10 rounded-lg">
                        <h4 className="text-boxing-green font-bold uppercase tracking-wider mb-4">Corner Team</h4>
                        <p className="text-sm text-gray-400">
                            Profesjonalna obsługa narożnika podczas walki. Cutman, trener główny, strategia w czasie rzeczywistym. Jesteśmy z Tobą do ostatniego gongu.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FightPrepSection;

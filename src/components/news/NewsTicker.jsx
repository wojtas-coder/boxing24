
import React from 'react';
import { motion } from 'framer-motion';

const NewsTicker = () => {
    const headlines = [
        "PILNE: Zuffa Boxing ogłasza kalendarz na 2026 rok!",
        "Wynik: Callum Walsh dominuje Ocampo (100-90, 100-90, 99-91)",
        "Plotki: Usyk vs Fury 3 w planach na lato?",
        "Trening: Nowy plan 'Elite Cardio' już dostępny w strefie klienta!",
        "Ważenie: Knyba 108kg, Kabayel 105kg - rewanż wisi w powietrzu."
    ];

    return (
        <div className="bg-red-600 text-white overflow-hidden py-2 border-b border-red-800">
            <div className="max-w-7xl mx-auto flex items-center px-4">
                <span className="font-black uppercase text-xs tracking-widest mr-4 bg-red-800 px-2 py-1 rounded">
                    Breaking
                </span>
                <div className="flex-1 overflow-hidden relative h-5">
                    <motion.div
                        className="whitespace-nowrap absolute"
                        animate={{ x: [1000, -1000] }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    >
                        {headlines.map((item, index) => (
                            <span key={index} className="mr-12 text-sm font-medium">
                                {item} •
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default NewsTicker;

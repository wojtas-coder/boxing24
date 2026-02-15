import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';

const NewsTicker = () => {
    const { data: headlines } = useQuery({
        queryKey: ['breakingNews'],
        queryFn: async () => {
            const { data } = await supabase
                .from('news')
                .select('title')
                .eq('is_breaking', true)
                .order('created_at', { ascending: false })
                .limit(5);
            return data?.map(n => n.title) || [];
        },
        staleTime: 60000,
    });

    const displayHeadlines = headlines?.length > 0 ? headlines : [
        "Boxing24.pl – Kompletny ekosystem treningowy dla ambitnych bokserów",
        "Treningi Personalne: Zarezerwuj sesję z elitarnym trenerem",
        "Strefa Wiedzy: Nowe artykuły o biomechanice ciosów",
    ];

    // Double the headlines for seamless infinite scroll
    const tickerContent = [...displayHeadlines, ...displayHeadlines];
    const totalWidth = tickerContent.length * 400; // approximate width

    return (
        <div className="bg-zinc-950 text-white overflow-hidden py-2.5 border-b border-white/[0.06]">
            <div className="max-w-7xl mx-auto flex items-center px-4">
                <span className="flex-shrink-0 font-black uppercase text-[10px] tracking-widest mr-4 bg-red-600 px-3 py-1 rounded-md">
                    Live
                </span>
                <div className="flex-1 overflow-hidden relative h-5">
                    <motion.div
                        className="whitespace-nowrap absolute flex"
                        animate={{ x: [0, -totalWidth / 2] }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    >
                        {tickerContent.map((item, index) => (
                            <span key={index} className="mr-16 text-sm text-zinc-400 font-medium">
                                {item}
                                <span className="ml-16 text-red-600/60">●</span>
                            </span>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default NewsTicker;

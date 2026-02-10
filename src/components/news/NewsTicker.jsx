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
        "PILNE: System Newsów Boxing24 wdrożony - zapraszamy do lektury!",
        "Strefa Wiedzy: Sprawdź nowe artykuły o psychologii sportu.",
        "Trening: Rezerwuj terminy online w kalendarzu."
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
                        animate={{ x: [1000, -1000] }} // Adjust logic for smoother loop if needed, but keeping simple for now
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    >
                        {displayHeadlines.map((item, index) => (
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

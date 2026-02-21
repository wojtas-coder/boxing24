import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Quote, Star, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TestimonialsSection = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetchActiveReviews();
    }, []);

    const fetchActiveReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('is_active', true)
                .order('order_index', { ascending: true });

            if (error) throw error;
            setReviews(data || []);
        } catch (err) {
            console.error("Error fetching testimonials:", err);
        } finally {
            setLoading(false);
        }
    };

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    if (loading || reviews.length === 0) return null;

    return (
        <section className="py-24 md:py-32 px-4 bg-black overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16 md:mb-24">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-red-500 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4 block"
                    >
                        Success Stories
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none"
                    >
                        Opinie <span className="text-stroke-white text-transparent">Podopiecznych</span>
                    </motion.h2>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Controls */}
                    <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-20">
                        <button onClick={prev} className="p-4 rounded-full bg-zinc-900 border border-white/10 text-white hover:bg-red-600 hover:border-red-600 transition-all group">
                            <ChevronLeft className="w-6 h-6 group-active:scale-90 transition-transform" />
                        </button>
                    </div>
                    <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-20">
                        <button onClick={next} className="p-4 rounded-full bg-zinc-900 border border-white/10 text-white hover:bg-red-600 hover:border-red-600 transition-all group">
                            <ChevronRight className="w-6 h-6 group-active:scale-90 transition-transform" />
                        </button>
                    </div>

                    <div className="relative overflow-hidden min-h-[400px] md:min-h-[350px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5, ease: "circOut" }}
                                className="bg-zinc-900/40 border border-white/5 backdrop-blur-xl rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row gap-8 md:gap-16 items-center"
                            >
                                <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] overflow-hidden border-2 border-red-600/20 flex-shrink-0">
                                    {reviews[currentIndex].avatar_url ? (
                                        <img
                                            src={reviews[currentIndex].avatar_url}
                                            alt={reviews[currentIndex].author_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                                            <User className="w-16 h-16" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex justify-center md:justify-start gap-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < reviews[currentIndex].rating ? 'text-red-500 fill-red-500' : 'text-zinc-700'}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="relative">
                                        <Quote className="absolute -top-6 -left-8 md:-left-12 w-12 h-12 text-red-600/20" />
                                        <p className="text-zinc-300 text-xl md:text-2xl font-medium leading-relaxed italic mb-8 relative z-10">
                                            {reviews[currentIndex].content}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="text-white font-black uppercase tracking-tighter text-xl">
                                            {reviews[currentIndex].author_name}
                                        </div>
                                        <div className="text-red-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                                            {reviews[currentIndex].author_role}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Indicators */}
                    <div className="flex justify-center gap-2 mt-8">
                        {reviews.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-red-600' : 'w-2 bg-zinc-800 hover:bg-zinc-700'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Star, ShieldCheck, Zap, Activity, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const ProductPage = () => {
    const { id } = useParams(); // URL slug
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('slug', id)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-boxing-green" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center flex-col gap-4">
                <div className="text-xl">Produkt nie znaleziony.</div>
                <Link to="/boutique" className="text-boxing-green hover:underline">Wróć do Sklepu</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Back Link */}
                <Link to="/boutique" className="inline-flex items-center text-gray-500 hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-widest">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Wróć do Butiku
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
                    {/* Visuals */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                            {product.badge && (
                                <div className="absolute top-6 left-6 z-10 bg-boxing-green text-white text-xs font-black uppercase px-4 py-2 tracking-widest shadow-lg">
                                    {product.badge}
                                </div>
                            )}
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {product.specs?.map((spec, i) => (
                                <div key={i} className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{spec.label}</div>
                                    <div className="text-white font-bold">{spec.value}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Editorial Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col justify-center"
                    >
                        <div className="flex items-center gap-4 text-boxing-green mb-4">
                            <span className="font-bold uppercase tracking-widest text-sm">{product.brand}</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-none uppercase italic">{product.name}</h1>
                        <div className="text-3xl font-bold text-gray-300 mb-8">{product.price}</div>

                        <div className="bg-white/5 border-l-4 border-boxing-green p-6 mb-10 rounded-r-lg backdrop-blur-sm">
                            <h3 className="text-boxing-green font-bold uppercase tracking-widest text-sm mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Werdykt Eksperta
                            </h3>
                            <p className="text-white text-lg font-medium italic">
                                "{product.verdict}"
                            </p>
                        </div>

                        <div className="space-y-8 text-gray-400 leading-relaxed font-light text-lg">
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-boxing-green" /> Technical Deep Dive
                                </h3>
                                <p>{product.deep_dive}</p>
                            </div>
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-boxing-green" /> Stress Test (12mc)
                                </h3>
                                <p>{product.stress_test}</p>
                            </div>
                        </div>

                        <div className="mt-12 flex gap-4">
                            <button className="flex-1 py-4 bg-boxing-green text-white font-bold uppercase tracking-widest hover:bg-green-700 transition-colors">
                                Zamów w Pre-Order
                            </button>
                            <button className="px-6 py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
                                Zapytaj o dostępność
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;

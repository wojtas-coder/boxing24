import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const BoutiquePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-white/10 pb-8">
                    <div>
                        <div className="flex items-center gap-3 text-boxing-green mb-2">
                            <ShoppingBag className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-widest text-sm">Official PunchIn Store</span>
                        </div>
                        <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">SKLEP PUNCHIN'</h1>
                    </div>
                    <p className="text-gray-400 max-w-md text-right mt-6 md:mt-0">
                        Wyselekcjonowany sprzęt. <br />
                        Tylko marki, którym ufamy. Zero kompromisów.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <Loader2 className="w-8 h-8 animate-spin text-boxing-green" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        Sklep jest aktualnie w przebudowie. Wkrótce pojawią się nowe produkty.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {products.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="group"
                            >
                                <Link to={`/boutique/${product.slug}`} className="block">
                                    <div className="relative aspect-square bg-zinc-900 rounded-xl overflow-hidden mb-6 border border-zinc-800 group-hover:border-boxing-green/50 transition-colors flex items-center justify-center">
                                        {product.badge && (
                                            <div className="absolute top-4 left-4 z-10 bg-white text-black text-xs font-black uppercase px-3 py-1 tracking-widest">
                                                {product.badge}
                                            </div>
                                        )}
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <span className="w-full py-3 bg-boxing-green text-white font-bold uppercase tracking-widest text-sm text-center">
                                                {product.stock_count <= 0 && !product.is_preorder ? 'Niedostępnie (Zobacz Opcje)' : 'Przeczytaj Recenzję'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-start mb-2 mt-4">
                                        <div>
                                            <h3 className="text-xs font-bold text-boxing-green uppercase tracking-widest mb-1">{product.brand} • {product.category || 'Produkt'}</h3>
                                            <h2 className="text-2xl font-bold text-white leading-none group-hover:text-boxing-green transition-colors">
                                                {product.name}
                                                {product.is_preorder && <span className="ml-2 text-[10px] bg-red-600 px-1 py-0.5 rounded text-white uppercase not-italic align-middle">Pre</span>}
                                            </h2>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="text-xl font-bold text-white whitespace-nowrap">{product.price}</div>
                                            {product.old_price && <div className="text-xs text-gray-500 line-through mt-1 text-right">{product.old_price}</div>}
                                        </div>
                                    </div>

                                    <div className="flex gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 text-boxing-green fill-current" />)}
                                    </div>

                                    <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4 py-1">
                                        {product.short_desc}
                                    </p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoutiquePage;

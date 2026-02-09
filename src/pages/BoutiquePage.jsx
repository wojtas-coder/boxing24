import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import { products } from '../data/products';

const BoutiquePage = () => {
    return (
        <div className="min-h-screen bg-black pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-white/10 pb-8">
                    <div>
                        <div className="flex items-center gap-3 text-boxing-green mb-2">
                            <ShoppingBag className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-widest text-sm">Official Store</span>
                        </div>
                        <h1 className="text-5xl font-black text-white italic uppercase">Boxer's Shop</h1>
                    </div>
                    <p className="text-gray-400 max-w-md text-right mt-6 md:mt-0">
                        Wyselekcjonowany sprzęt. <br />
                        Tylko marki, którym ufamy. Zero kompromisów.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="group"
                        >
                            <Link to={`/boutique/${product.id}`} className="block">
                                <div className="relative aspect-square bg-zinc-900 rounded-xl overflow-hidden mb-6 border border-zinc-800 group-hover:border-boxing-green/50 transition-colors">
                                    <div className="absolute top-4 left-4 z-10 bg-white text-black text-xs font-black uppercase px-3 py-1 tracking-widest">
                                        {product.badge}
                                    </div>
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                        <span className="w-full py-3 bg-boxing-green text-white font-bold uppercase tracking-widest text-sm text-center">
                                            Przeczytaj Recenzję
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xs font-bold text-boxing-green uppercase tracking-widest mb-1">{product.brand}</h3>
                                        <h2 className="text-2xl font-bold text-white leading-none group-hover:text-boxing-green transition-colors">{product.name}</h2>
                                    </div>
                                    <div className="text-xl font-bold text-white">{product.price}</div>
                                </div>

                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 text-boxing-green fill-current" />)}
                                </div>

                                <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-zinc-800 pl-4 py-1">
                                    {product.shortDesc}
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BoutiquePage;

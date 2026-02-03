
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const NewsCard = ({ news, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative flex flex-col bg-zinc-900 border overflow-hidden transition-colors h-full ${news.is_article ? 'border-blue-900/50 hover:border-blue-500' : 'border-zinc-800 hover:border-red-600/50'
                }`}
        >
            {/* OVERLAY LINK - Makes whole card clickable */}
            <Link to={`/news/${news.slug}`} className="absolute inset-0 z-10" aria-label={news.title} />

            {/* Image Container */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={news.image_url || 'https://images.unsplash.com/photo-1615117970347-bf415e58986c?q=80&w=1000&auto=format&fit=crop'}
                    alt={news.title}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1615117970347-bf415e58986c?q=80&w=1000&auto=format&fit=crop';
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
                <div className={`absolute top-2 left-2 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${news.is_article ? 'bg-blue-600' : 'bg-red-600'
                    }`}>
                    {news.category}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow relative pointer-events-none">
                <div className="text-zinc-500 text-xs mb-2 flex items-center gap-2">
                    <span>{new Date(news.published_at).toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                    <span>{news.author}</span>
                </div>

                <h3 className={`text-lg font-bold text-white mb-3 leading-tight transition-colors ${news.is_article ? 'group-hover:text-blue-500' : 'group-hover:text-red-500'
                    }`}>
                    {news.title}
                </h3>

                <p className="text-zinc-400 text-sm mb-4 line-clamp-3">
                    {news.excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-zinc-800/50">
                    <span
                        className={`inline-flex items-center text-xs font-bold uppercase tracking-widest transition-colors ${news.is_article ? 'text-blue-500 group-hover:text-white' : 'text-red-500 group-hover:text-white'
                            }`}
                    >
                        Czytaj Więcej <ArrowRight className="w-3 h-3 ml-1" />
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default NewsCard;

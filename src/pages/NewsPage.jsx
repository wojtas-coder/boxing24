import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import NewsCard from '../components/news/NewsCard';
import NewsTicker from '../components/news/NewsTicker';
import NewsSidebar from '../components/news/NewsSidebar';
import { mockNews } from '../data/mockNews';
import { articles } from '../data/articles';
import fileNews from '../data/news.json';


const NewsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    // Prioritize File News (Bot) -> Then Mock News
    const [newsItems, setNewsItems] = useState([...fileNews, ...mockNews]);
    const [loading, setLoading] = useState(false);

    // Removed manual fetch to ensure JAMSTACK reliability
    // Content is bundled at build time.

    // Filter Logic if Search Term exists
    const filteredNews = newsItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayItems = searchTerm ? filteredNews : newsItems.slice(0, 15);

    // Separate main featured article from the rest
    const featuredNews = displayItems[0] || mockNews[0];

    // Combine remaining News with selected Expert Articles
    const remainingNews = displayItems.slice(1);

    const keyArticles = articles
        .filter(a => ['psychology-flow', 'biomechanics-kinetic', 'recovery-sleep'].includes(a.id))
        .map(a => {
            const categoryMap = {
                'HISTORY': 'HISTORIA',
                'NUTRITION': 'DIETETYKA',
                'SAFETY': 'BEZPIECZEŃSTWO',
                'TACTICS': 'TAKTYKA',
                'MENTAL': 'PSYCHOLOGIA',
                'SCIENCE': 'NAUKA',
                'RECOVERY': 'REGENERACJA'
            };

            return {
                ...a,
                slug: a.id,
                image_url: a.image,
                published_at: new Date().toISOString(),
                category: categoryMap[a.category] || a.category,
                is_article: true
            };
        });

    // Create a mixed feed (alternating)
    const mixedFeed = [];
    let nIdx = 0;

    // Pattern: 2 News -> 1 Article -> repeat
    if (keyArticles[0]) mixedFeed.push(keyArticles[0]);
    if (remainingNews[0]) mixedFeed.push(remainingNews[0]);
    if (remainingNews[1]) mixedFeed.push(remainingNews[1]);
    if (keyArticles[1]) mixedFeed.push(keyArticles[1]);
    if (remainingNews[2]) mixedFeed.push(remainingNews[2]);
    if (remainingNews[3]) mixedFeed.push(remainingNews[3]);
    if (keyArticles[2]) mixedFeed.push(keyArticles[2]);

    // Fill rest
    while (nIdx < remainingNews.length) {
        if (!mixedFeed.includes(remainingNews[nIdx])) {
            mixedFeed.push(remainingNews[nIdx]);
        }
        nIdx++;
    }

    // Split for layout (Top Row vs Bottom Grid)
    const secondaryNews = mixedFeed.slice(0, 2);
    const gridNews = mixedFeed.slice(2);

    return (
        <div className="min-h-screen bg-black text-white pt-[64px]">
            {/* Ticker */}
            <NewsTicker />

            <div className="max-w-[1400px] mx-auto p-4 md:p-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-zinc-800 pb-6 gap-6">
                    <div className="flex items-baseline gap-4">
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                            Boxing<span className="text-red-600">24</span> News
                        </h1>
                        <span className="text-zinc-500 text-sm hidden md:inline-block">
                            Wiarygodne źródło • Analizy • Wyniki
                        </span>
                    </div>

                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Szukaj artykułu, zawodnika..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2 pl-10 text-sm rounded-none focus:outline-none focus:border-red-600 transition-colors"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Column (Content) - Spans 3 columns */}
                    <div className="lg:col-span-3 space-y-8">

                        {/* Hero Section: Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[500px]">
                            {/* Main Feature */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="relative md:col-span-2 md:row-span-2 group overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer"
                            >
                                <Link to={`/news/${featuredNews.slug}`} className="absolute inset-0 z-20" aria-label={featuredNews.title} />
                                <img
                                    src={featuredNews.image_url}
                                    alt={featuredNews.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                                    <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-2 py-1 mb-3 inline-block">
                                        Temat Dnia
                                    </span>
                                    <h2 className="text-2xl md:text-4xl font-black text-white mb-2 leading-none group-hover:text-red-500 transition-colors">
                                        {featuredNews.title}
                                    </h2>
                                    <p className="text-zinc-300 text-sm md:text-base line-clamp-2 max-w-2xl">
                                        {featuredNews.excerpt}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Secondary Stories Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {secondaryNews.map((news, idx) => (
                                <NewsCard key={news.id || news.slug} news={news} index={idx} />
                            ))}
                        </div>

                        {/* Latest News Header */}
                        <div className="flex items-center justify-between border-l-4 border-red-600 pl-4 mt-12 mb-6">
                            <h3 className="text-xl font-bold uppercase tracking-wider text-white">
                                Najnowsze Doniesienia
                            </h3>
                            <button className="text-xs text-zinc-500 hover:text-white uppercase font-bold flex items-center gap-1 transition-colors">
                                Zobacz Archiwum <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Standard Grid for the rest */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {gridNews.map((news, idx) => (
                                <NewsCard key={news.id || news.slug} news={news} index={idx + 2} />
                            ))}
                        </div>

                    </div>

                    {/* Right Column (Sidebar) - Spans 1 column */}
                    <div className="lg:col-span-1 border-l border-zinc-800 lg:pl-8">
                        <NewsSidebar />
                    </div>

                </div>

                {/* Footer Ad Banner */}
                <div className="mt-16 bg-zinc-900 border border-zinc-800 p-8 text-center">
                    <span className="text-zinc-600 text-[10px] uppercase tracking-widest mb-2 block">Reklama Partnera</span>
                    <h2 className="text-2xl font-black uppercase text-white mb-4">
                        Twoja Marka Tutaj?
                    </h2>
                    <p className="text-zinc-400 mb-6">
                        Dotrzyj do tysięcy fanów boksu w Polsce. Skontaktuj się z działem marketingu.
                    </p>
                    <button className="bg-white text-black px-6 py-2 text-xs font-bold uppercase hover:bg-zinc-200 transition-colors">
                        Współpraca
                    </button>
                </div>

            </div>
        </div>
    );
};

export default NewsPage;

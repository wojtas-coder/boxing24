import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import NewsCard from '../components/news/NewsCard';
import NewsTicker from '../components/news/NewsTicker';
import NewsSidebar from '../components/news/NewsSidebar';
import { articles } from '../data/articles';
import localNews from '../data/news.json';

const ITEMS_PER_PAGE = 20;
const NEWS_PER_PAGE = 16;
const EXPERTS_PER_PAGE = 4;

const NewsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch News from Supabase with Pagination
    const { data: newsData, isLoading, error: newsError, refetch } = useQuery({
        queryKey: ['news', currentPage],
        queryFn: async () => {
            const from = (currentPage - 1) * NEWS_PER_PAGE;
            const to = from + NEWS_PER_PAGE - 1;

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout: Serwer nie odpowiada')), 5000)
            );

            const supabasePromise = supabase
                .from('news')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            // Race against timeout
            const { data, count, error } = await Promise.race([supabasePromise, timeoutPromise]);

            if (error) throw error;

            return {
                items: (data || []).map(item => ({
                    ...item,
                    excerpt: item.lead,
                    published_at: item.created_at,
                    author: item.author_name
                })),
                totalCount: count || 0
            };
        },
        retry: 1, // Don't retry too much if timeout happens
    });

    // Merge and Robust Mapping
    const rawNewsItems = newsData?.items || [];
    const totalNewsCount = newsData?.totalCount || localNews.length;

    // Map local news to match Supabase structure if needed
    const mappedLocalNews = localNews.map(item => ({
        ...item,
        is_local: true,
        published_at: item.published_at || new Date().toISOString()
    }));

    // Combine: Latest Supabase items first, then unique local items
    const combinedNews = [...rawNewsItems];
    mappedLocalNews.forEach(localItem => {
        if (!combinedNews.find(n => n.slug === localItem.slug)) {
            combinedNews.push(localItem);
        }
    });

    const newsItems = combinedNews;

    console.log("News Data Context:", {
        supabaseCount: rawNewsItems.length,
        localCount: localNews.length,
        combinedTotal: newsItems.length
    });

    const filteredNews = searchTerm
        ? newsItems.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
        : newsItems;

    const displayItems = searchTerm ? filteredNews : newsItems;

    // Expert Articles Logic
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
                published_at: new Date().toISOString(), // Or keep fixed date
                category: categoryMap[a.category] || a.category,
                is_article: true,
                excerpt: a.intro || a.content.substring(0, 100) + '...'
            };
        });

    // Create a mixed feed (Interleaving pattern: 4 News, 1 Expert)
    const mixedFeed = [];
    const displayNews = filteredNews;

    // Expert pagination selection logic
    const getExpertArticlesForPage = (page) => {
        const startIndex = (page - 1) * EXPERTS_PER_PAGE;
        // Map all articles to common format
        const allExperts = articles.map(a => ({
            ...a,
            slug: a.id,
            image_url: a.image,
            published_at: new Date(2025, 0, 1).toISOString(), // Standard date for knowledge items
            category: {
                'HISTORY': 'HISTORIA',
                'NUTRITION': 'DIETETYKA',
                'SAFETY': 'BEZPIECZEŃSTWO',
                'TACTICS': 'TAKTYKA',
                'MENTAL': 'PSYCHOLOGIA',
                'SCIENCE': 'NAUKA',
                'RECOVERY': 'REGENERACJA'
            }[a.category] || a.category,
            is_article: true,
            excerpt: a.excerpt || (a.content ? a.content.substring(0, 120) + '...' : '')
        }));

        // Rotate through articles if we run out
        return Array.from({ length: EXPERTS_PER_PAGE }, (_, i) => {
            return allExperts[(startIndex + i) % allExperts.length];
        });
    };

    const currentExperts = getExpertArticlesForPage(currentPage);

    // Weave news and experts
    if (displayNews.length > 0) {
        let newsIdx = 0;
        let expertIdx = 0;

        while (newsIdx < displayNews.length || expertIdx < currentExperts.length) {
            // Add up to 4 news
            for (let i = 0; i < 4 && newsIdx < displayNews.length; i++) {
                mixedFeed.push(displayNews[newsIdx++]);
            }
            // Add 1 expert
            if (expertIdx < currentExperts.length) {
                mixedFeed.push(currentExperts[expertIdx++]);
            }
        }
    } else if (!isLoading) {
        mixedFeed.push(...currentExperts);
    }

    const totalPages = Math.ceil(totalNewsCount / NEWS_PER_PAGE);

    const handlePageChange = (page) => {
        setSearchParams({ page: page.toString() });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Featured and Grid Split
    const featuredNews = mixedFeed[0] || { title: "", excerpt: "", slug: "#", image_url: "" };
    const secondaryNews = mixedFeed.slice(1, 3);
    const gridNews = mixedFeed.slice(3);

    return (
        <div className="min-h-screen bg-black text-white pt-[64px]">
            <NewsTicker />

            <div className="max-w-[1400px] mx-auto p-4 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-zinc-800 pb-6 gap-6">
                    <div className="flex items-baseline gap-4">
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                            Boxing<span className="text-red-600">24</span> News
                        </h1>
                        <span className="text-zinc-500 text-sm hidden md:inline-block">
                            Strona {currentPage} • {totalNewsCount} artykułów
                        </span>
                    </div>

                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Szukaj artykułu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2 pl-10 text-sm rounded-none focus:outline-none focus:border-red-600 transition-colors"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : newsError ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                        <div className="text-red-500 text-6xl font-black">!</div>
                        <h2 className="text-white text-xl font-bold uppercase">Problem z ładowaniem newsów</h2>
                        <p className="text-zinc-500 text-sm max-w-md text-center">
                            {newsError.message}
                            <br />
                            <span className="text-xs font-mono text-zinc-600 mt-2 block">{JSON.stringify(newsError)}</span>
                        </p>
                        <button onClick={() => refetch()} className="px-6 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-500 transition-colors">
                            Spróbuj Ponownie
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-3 space-y-8">
                                {/* Hero */}
                                {featuredNews.title && (
                                    <div className="h-auto md:h-[400px]">
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="relative h-full group overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer"
                                        >
                                            <Link to={featuredNews.is_article ? `/news/${featuredNews.slug}` : `/news/${featuredNews.slug}`} className="absolute inset-0 z-20" />
                                            <img
                                                src={featuredNews.image_url || "/api/placeholder/1200/800"}
                                                alt={featuredNews.title}
                                                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-60"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                                                <span className={`text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-3 inline-block ${featuredNews.is_breaking ? 'bg-red-600' : (featuredNews.is_article ? 'bg-blue-600' : 'bg-red-600')}`}>
                                                    {featuredNews.is_breaking ? 'Breaking' : (featuredNews.is_article ? 'Wiedza' : 'Temat Dnia')}
                                                </span>
                                                <h2 className="text-2xl md:text-4xl font-black text-white mb-2 leading-none group-hover:text-red-500 transition-colors uppercase tracking-tighter">
                                                    {featuredNews.title}
                                                </h2>
                                                <p className="text-zinc-300 text-xs md:text-base line-clamp-2 max-w-2xl font-medium">
                                                    {featuredNews.excerpt}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                                {/* Secondary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {secondaryNews.map((news, idx) => (
                                        <NewsCard key={news.id || news.slug + idx} news={news} index={idx} />
                                    ))}
                                </div>

                                {/* Feed Header */}
                                <div className="flex items-center justify-between border-l-4 border-red-600 pl-4 mt-12 mb-8">
                                    <h3 className="text-xl font-bold uppercase tracking-wider text-white">
                                        Najnowsze Doniesienia
                                    </h3>
                                </div>

                                {/* Main Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {gridNews.map((news, idx) => (
                                        <NewsCard key={news.id || news.slug + idx} news={news} index={idx + 3} />
                                    ))}
                                </div>

                                {/* Pagination UI */}
                                {totalPages > 1 && (
                                    <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-4 py-8 border-t border-zinc-800">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-xs font-bold uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:border-red-600 transition-colors flex items-center gap-2"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Poprzednia
                                        </button>

                                        <div className="flex items-center gap-2">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`w-10 h-10 flex items-center justify-center text-xs font-bold transition-all ${currentPage === page
                                                        ? 'bg-red-600 text-white border-red-600'
                                                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-600'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white text-xs font-bold uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:border-red-600 transition-colors flex items-center gap-2"
                                        >
                                            Następna <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-1 border-l border-zinc-800 lg:pl-8">
                                <NewsSidebar />
                            </div>
                        </div>
                    </>
                )}
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
    );
};


export default NewsPage;

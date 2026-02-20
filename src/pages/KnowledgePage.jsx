import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, BookOpen, X, Lock, Crown, Filter, CheckCircle, ChevronRight, PlayCircle, GraduationCap, Star, ShoppingBag, Microscope, Database, Menu, ChevronDown, Search, Clock, Bookmark, TrendingUp, BookmarkCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabaseData as supabase } from '../lib/supabaseClient';
import { articles as localArticles } from '../data/articles'; // Fallback / mixed logic
import { compendium } from '../data/compendium';
import { reviews } from '../data/reviews';
import { getProgress, isBookmarked, toggleBookmark, getContinueReading, getStats } from '../utils/libraryProgress';
import { useAuth } from '../context/AuthContext';

const KnowledgePage = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('articles'); // articles, compendium, reviews
    const { user, profile, isPremium } = useAuth();
    const isVip = isPremium;

    // Database State
    const [dbArticles, setDbArticles] = useState([]);
    const [loadingDb, setLoadingDb] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const { data, error } = await supabase
                    .from('knowledge_articles')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    // Map Supabase layout to component expectations
                    const mapped = data.map(item => ({
                        id: item.id,
                        title: item.title,
                        slug: item.slug,
                        excerpt: item.excerpt,
                        content: item.content,
                        category: item.category,
                        image: item.image_url,
                        author: item.author_name,
                        readingTime: item.reading_time_min,
                        difficulty: item.difficulty_level,
                        isPremium: item.is_premium,
                        hasDualVersion: item.has_dual_version,
                        freeContent: item.free_content,
                        premiumContent: item.premium_content,
                        tags: item.tags || [],
                        updatedAt: item.updated_at
                    }));
                    setDbArticles(mapped);
                }
            } catch (err) {
                console.error("Failed to load knowledge articles", err);
            } finally {
                setLoadingDb(false);
            }
        };
        fetchArticles();
    }, []);

    // Combine local dummy data with DB data (DB takes precedence if same ID, though IDs differ)
    // In production, we'd entirely drop localArticles once DB is populated.
    const allArticles = useMemo(() => {
        return [...dbArticles]; // Switched entirely to DB for articles tab as requested strictly DB driven
    }, [dbArticles]);

    useEffect(() => {
        const view = searchParams.get('view');
        if (view && ['articles', 'compendium', 'reviews'].includes(view)) {
            setActiveTab(view);
        }
    }, [searchParams]);

    // Articles State
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [readingMode, setReadingMode] = useState(null); // null (selector), 'free', 'premium'
    const [activeFilter, setActiveFilter] = useState('ALL');

    // Compendium State
    const [expandedModule, setExpandedModule] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);

    // Reviews State
    const [reviewFilter, setReviewFilter] = useState('ALL');

    // Power Search
    const [searchQuery, setSearchQuery] = useState('');

    // Bookmark trigger for re-renders
    const [bookmarkUpdates, setBookmarkUpdates] = useState(0);



    // --- HELPER WRAPPERS ---

    // Global search across all content
    const searchContent = (content, query) => {
        if (!query) return content;
        const lowerQuery = query.toLowerCase();
        return content.filter(item =>
            item.title?.toLowerCase().includes(lowerQuery) ||
            item.excerpt?.toLowerCase().includes(lowerQuery) ||
            item.category?.toLowerCase().includes(lowerQuery) ||
            item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    };

    // 1. ARTICLES VIEW
    const ArticlesView = () => {
        const categories = useMemo(() => ['ALL', ...new Set(allArticles.map(a => a.category?.toUpperCase() || ''))], [allArticles]);

        // Apply search first, then category filter
        const searchedArticles = searchContent(allArticles, searchQuery);
        const filteredFree = searchedArticles.filter(a => !a.isPremium && (activeFilter === 'ALL' || a.category?.toUpperCase() === activeFilter));
        const filteredPremium = searchedArticles.filter(a => a.isPremium && (activeFilter === 'ALL' || a.category?.toUpperCase() === activeFilter));

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Filter Bar */}
                <div className="flex gap-2 overflow-x-auto pb-6 mb-8 no-scrollbar mask-gradient">
                    {categories.map((cat, i) => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${activeFilter === cat ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Free Articles Grid */}
                {filteredFree.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {filteredFree.map((article, i) => {
                            const progress = getProgress(article.id, 'article');
                            const bookmarked = isBookmarked(article.id, 'article');
                            const isNew = article.updatedAt && new Date(article.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Updated in last 7 days

                            return (
                                <div key={article.id} className="group cursor-pointer relative">
                                    {/* Image */}
                                    <div className="aspect-video rounded-xl overflow-hidden mb-4 relative" onClick={() => setSelectedArticle(article)}>
                                        <img src={article.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                                        {/* Category Badge */}
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-white tracking-widest border border-white/10">
                                            {article.category}
                                        </div>

                                        {/* NEW Badge */}
                                        {isNew && (
                                            <div className="absolute top-2 right-2 bg-boxing-green/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase text-black tracking-widest">
                                                NEW
                                            </div>
                                        )}

                                        {/* Completion Badge */}
                                        {progress.completed && (
                                            <div className="absolute bottom-2 left-2 bg-green-500/90 backdrop-blur px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold">
                                                <CheckCircle className="w-3 h-3" />
                                                UKOŃCZONO
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div onClick={() => setSelectedArticle(article)}>
                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-boxing-green transition-colors">{article.title}</h3>
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-3">{article.excerpt}</p>
                                    </div>

                                    {/* Metadata Row */}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-3">
                                            {article.readingTime && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{article.readingTime} min</span>
                                                </div>
                                            )}
                                            {article.difficulty && (
                                                <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
                                                    {article.difficulty}
                                                </div>
                                            )}
                                        </div>

                                        {/* Bookmark Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleBookmark(article.id, 'article');
                                                setBookmarkUpdates(prev => prev + 1);
                                            }}
                                            className="p-2 rounded-lg hover:bg-boxing-green/10 transition-all border border-transparent hover:border-boxing-green/30"
                                            title="Dodaj do zakładek"
                                        >
                                            {bookmarked ? (
                                                <BookmarkCheck className="w-5 h-5 text-boxing-green fill-boxing-green" />
                                            ) : (
                                                <Bookmark className="w-5 h-5 text-gray-400 hover:text-boxing-green transition-colors" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Premium Grid */}
                <div className="border-t border-white/10 pt-12">
                    <div className="flex items-center gap-3 mb-8">
                        <Lock className="w-5 h-5 text-boxing-green" />
                        <h2 className="text-xl font-bold text-white uppercase tracking-widest">Premium Archive</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredPremium.map((article) => (
                            <div
                                key={article.id}
                                onClick={() => setSelectedArticle(article)}
                                className={`p-4 rounded-xl border cursor-pointer hover:bg-white/5 transition-colors ${isVip ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/10 bg-zinc-900/50'}`}
                            >
                                <div className="flex justify-between mb-3">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{article.category}</span>
                                    {isVip ? <Crown className="w-3 h-3 text-indigo-400" /> : <Lock className="w-3 h-3 text-gray-600" />}
                                </div>
                                <h4 className="font-bold text-white text-sm line-clamp-2">{article.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        )
    };

    // 2. COMPENDIUM VIEW (ACADEMIC TREE)
    const CompendiumView = () => {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <GraduationCap className="w-12 h-12 text-boxing-green mx-auto mb-4" />
                    <h2 className="text-3xl font-black text-white uppercase italic">Syllabus Akademicki</h2>
                    <p className="text-gray-400 mt-2">Uporządkowana ścieżka rozwoju. Od podstaw do doktoratu.</p>
                </div>

                <div className="space-y-12 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-boxing-green via-white/10 to-transparent -translate-x-1/2 hidden md:block"></div>

                    {compendium.map((level, index) => (
                        <div key={level.id} className="relative z-10">
                            {/* Level Header */}
                            <div className="bg-[#111] border border-white/10 p-8 rounded-3xl mb-6 relative hover:border-boxing-green/50 transition-colors group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl text-white select-none">{index + 1}</div>
                                <div className="relative z-10">
                                    <div className="text-boxing-green font-mono text-xs uppercase tracking-widest mb-2">{level.subtitle}</div>
                                    <h3 className="text-3xl font-black text-white uppercase mb-4">{level.title}</h3>
                                    <p className="text-gray-400 max-w-2xl leading-relaxed">{level.description}</p>
                                </div>
                            </div>

                            {/* Modules Accordion */}
                            <div className="grid gap-4 pl-4 md:pl-0">
                                {level.modules.map((module) => (
                                    <div key={module.id} className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                                            className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold ${expandedModule === module.id ? 'bg-boxing-green text-black border-boxing-green' : 'border-white/20 text-gray-500'}`}>
                                                    {index + 1}.{level.modules.indexOf(module) + 1}
                                                </div>
                                                <span className="font-bold text-white text-lg">{module.title}</span>
                                            </div>
                                            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedModule === module.id ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {expandedModule === module.id && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-6 pt-0 border-t border-white/5 space-y-2">
                                                        {module.lessons.map((lesson) => (
                                                            <div
                                                                key={lesson.id}
                                                                onClick={() => setSelectedLesson(lesson)}
                                                                className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 cursor-pointer group"
                                                            >
                                                                <PlayCircle className="w-5 h-5 text-gray-600 group-hover:text-boxing-green transition-colors" />
                                                                <div className="flex-1">
                                                                    <div className="text-gray-300 font-medium group-hover:text-white">{lesson.title}</div>
                                                                </div>
                                                                {isVip ? (
                                                                    <div className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-1 rounded">DOSTĘPNE</div>
                                                                ) : (
                                                                    <Lock className="w-4 h-4 text-gray-600" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        )
    };

    // 3. REVIEWS VIEW
    const ReviewsView = () => {
        const types = ['ALL', 'GEAR', 'FIGHT', 'SUPPLEMENT'];
        const filteredReviews = reviews.filter(r => reviewFilter === 'ALL' || r.category === reviewFilter);

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-center gap-4 mb-12">
                    {types.map(t => (
                        <button
                            key={t}
                            onClick={() => setReviewFilter(t)}
                            className={`px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs transition-all ${reviewFilter === t ? 'bg-boxing-green text-black' : 'bg-zinc-900 text-gray-500 hover:text-white'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredReviews.map((review) => (
                        <div key={review.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:border-white/20 transition-colors">
                            <div className="w-full md:w-48 h-48 bg-black rounded-xl overflow-hidden flex-shrink-0">
                                <img src={review.image} alt={review.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase border border-white/10 px-2 py-1 rounded">{review.type}</span>
                                    <div className="flex text-yellow-500 gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(review.rating) ? 'fill-current' : 'text-gray-700'}`} />
                                        ))}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{review.title}</h3>
                                <div className="text-boxing-green font-bold text-sm mb-4">{review.price}</div>
                                <p className="text-gray-400 text-sm leading-relaxed mb-4">{review.summary}</p>

                                <button
                                    onClick={() => setSelectedLesson({ ...review, content: review.verdict + "<h3>Werdykt</h3>" + review.summary })} // Hack to reuse modal
                                    className="text-xs font-bold uppercase tracking-widest text-white hover:text-boxing-green transition-colors"
                                >
                                    Przeczytaj Pełną Recenzję &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        )
    };

    return (
        <div className="pt-32 pb-20 px-4 min-h-screen bg-black text-white selection:bg-boxing-green selection:text-white">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-4">
                        Boksopedia<span className="text-boxing-green">.</span>
                    </h1>
                    <p className="text-gray-500 mb-8">Centralna Baza Wiedzy Boxing24</p>

                    {/* Power Search */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Szukaj artykułów, lekcji, recenzji..." className="w-full bg-zinc-900/50 border border-white/10 rounded-full pl-12 pr-24 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-boxing-green/50 transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600 px-2 py-1 bg-white/5 rounded border border-white/10">
                                ⌘K
                            </div>
                        </div>
                    </div>

                    {/* Continue Reading */}
                    {(() => {
                        const continueItems = getContinueReading(3);
                        if (continueItems.length > 0) {
                            return (
                                <div className="max-w-4xl mx-auto mb-8">
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <BookOpen className="w-4 h-4 text-boxing-green" />
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Kontynuuj Czytanie</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {continueItems.map((item) => {
                                            const content = item.type === 'article' ? allArticles.find(a => a.id === item.id) : null;
                                            if (!content) return null;

                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setSelectedArticle(content)}
                                                    className="bg-zinc-900/50 border border-white/10 rounded-lg p-3 cursor-pointer hover:border-boxing-green/30 transition-all group"
                                                >
                                                    <h4 className="text-white text-xs font-bold line-clamp-2 group-hover:text-boxing-green transition-colors mb-2">
                                                        {content.title}
                                                    </h4>
                                                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                                                        <span>{item.progress}% ukończone</span>
                                                        {content.readingTime && <span>{content.readingTime} min</span>}
                                                    </div>
                                                    <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                                                        <div className="h-full bg-boxing-green transition-all" style={{ width: `${item.progress}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                {/* VIP Banner */}
                {isVip && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-center gap-3">
                        <Crown className="w-5 h-5 text-indigo-400" />
                        <span className="text-indigo-200 font-bold text-sm uppercase tracking-widest">VIP Access Unlocked</span>
                    </motion.div>
                )}

                {/* Main Navigation Tabs */}
                <div className="flex border-b border-white/10 mb-12">
                    {[
                        { id: 'articles', label: 'Artykuły', icon: Microscope },
                        { id: 'compendium', label: 'Kompendium', icon: Database },
                        { id: 'reviews', label: 'Recenzje', icon: ShoppingBag },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-300'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-boxing-green" />}
                        </button>
                    ))}
                </div>

                {/* Content Render */}
                <div className="min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'articles' && <ArticlesView />}
                            {activeTab === 'compendium' && <CompendiumView />}
                            {activeTab === 'reviews' && <ReviewsView />}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>

            {/* SHARED MODAL (For Articles, Lessons, Reviews) */}
            <AnimatePresence>
                {(selectedArticle || selectedLesson) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedArticle(null); setSelectedLesson(null); setReadingMode(null); }} className="absolute inset-0 bg-black/90 backdrop-blur-xl"></motion.div>
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="w-full max-w-4xl bg-[#111] border border-white/10 rounded-3xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col shadow-2xl">

                            {/* Close Button */}
                            <button onClick={() => { setSelectedArticle(null); setSelectedLesson(null); setReadingMode(null); }} className="absolute top-6 right-6 z-50 bg-black/50 p-2 rounded-full text-white hover:bg-white hover:text-black transition-colors border border-white/10">
                                <X className="w-6 h-6" />
                            </button>

                            {/* Content Wrapper */}
                            <div className="overflow-y-auto custom-scrollbar flex-grow p-8 sm:p-16">
                                { /* DUAL VERSION SELECTOR LOGIC */}
                                {(selectedArticle || selectedLesson) && (selectedArticle?.hasDualVersion) && !readingMode ? (
                                    <div className="flex flex-col h-full">
                                        <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase mb-4 leading-tight text-center">
                                            {(selectedArticle || selectedLesson).title}
                                        </h2>
                                        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
                                            Wybierz ścieżkę. Wiedza podstawowa dla każdego lub akademicka analiza dla profesjonalistów.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                                            {/* FREE OPTION */}
                                            <div
                                                onClick={() => setReadingMode('free')}
                                                className="group relative bg-zinc-900 border border-white/10 rounded-3xl p-8 hover:bg-white/5 transition-all cursor-pointer flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                                        <BookOpen className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white uppercase mb-2">Brief Taktyczny</h3>
                                                    <p className="text-gray-500 text-sm">
                                                        Skondensowana wiedza. Najważniejsze wnioski, bez akademickiego żargonu. Idealne do szybkiego przeczytania przed treningiem.
                                                    </p>
                                                </div>
                                                <div className="mt-8 flex items-center text-white font-bold text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                                    Czytaj Za Darmo <ArrowUpRight className="w-4 h-4 ml-2" />
                                                </div>
                                            </div>

                                            {/* PREMIUM OPTION */}
                                            <div
                                                onClick={() => setReadingMode('premium')}
                                                className={`group relative border rounded-3xl p-8 transition-all cursor-pointer flex flex-col justify-between ${isVip ? 'bg-indigo-950/20 border-indigo-500/30 hover:bg-indigo-900/30' : 'bg-zinc-900 border-white/10 hover:border-boxing-green/50'}`}
                                            >
                                                <div>
                                                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                                        {isVip ? <Crown className="w-6 h-6 text-indigo-400" /> : <Lock className="w-6 h-6 text-gray-500" />}
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white uppercase mb-2 flex items-center gap-3">
                                                        Pełny Raport
                                                        {!isVip && <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-gray-400 border border-white/10">VIP ONLY</span>}
                                                    </h3>
                                                    <p className="text-gray-500 text-sm">
                                                        Poziom akademicki. Analiza badań, neurobiologii i pełne protokoły. Dla trenerów i zawodowców.
                                                    </p>
                                                </div>
                                                <div className="mt-8 flex items-center font-bold text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform text-indigo-300">
                                                    {isVip ? 'Otwórz Raport' : 'Odblokuj Dostęp'} <ArrowUpRight className="w-4 h-4 ml-2" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* CONTENT RENDER */
                                    <>
                                        {(selectedArticle || selectedLesson).image && (
                                            <img src={(selectedArticle || selectedLesson).image} className="w-full h-80 object-cover rounded-2xl mb-10 opacity-50" />
                                        )}

                                        <span className="text-boxing-green font-bold uppercase tracking-widest text-xs mb-4 block">
                                            {readingMode === 'free' ? 'Wersja Brief' : ((selectedArticle || selectedLesson).category || 'Lesson')}
                                        </span>

                                        <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase mb-8 leading-tight">
                                            {(selectedArticle || selectedLesson).title}
                                        </h2>

                                        {(selectedArticle || selectedLesson).author && (
                                            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-white/10">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                                                    <span className="text-boxing-green font-black text-xs">WR</span>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Autor</div>
                                                    <div className="text-white font-bold text-sm">{(selectedArticle || selectedLesson).author}</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* GATING LOGIC */}
                                        {((!isVip && (activeTab === 'compendium' || (selectedArticle && selectedArticle.isPremium) || (readingMode === 'premium')))) ? (
                                            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-12 text-center">
                                                <Lock className="w-16 h-16 text-boxing-green mx-auto mb-6" />
                                                <h3 className="text-2xl font-bold text-white mb-4">Treść Zablokowana</h3>
                                                <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                                                    To specjalistyczna wiedza akademicka poziomu University. Dostępna tylko dla posiadaczy karty członkowskiej Elite.
                                                </p>
                                                <Link to="/membership" className="px-8 py-4 bg-boxing-green text-black font-bold uppercase tracking-widest rounded-full hover:bg-white transition-colors">
                                                    Odblokuj Dostęp (Dołącz do Elity)
                                                </Link>
                                                {/* Back option if stuck in Premium mode without access */}
                                                {readingMode === 'premium' && (
                                                    <button onClick={() => setReadingMode(null)} className="block mx-auto mt-6 text-xs text-gray-500 hover:text-white uppercase tracking-widest">
                                                        &larr; Wróć do wyboru
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            // UNLOCKED CONTENT
                                            <div className="prose-premium">
                                                <div dangerouslySetInnerHTML={{ __html: (readingMode === 'free' && selectedArticle?.freeContent) ? selectedArticle.freeContent : ((readingMode === 'premium' && selectedArticle?.premiumContent) ? selectedArticle.premiumContent : (selectedArticle || selectedLesson).content) }} />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default KnowledgePage;

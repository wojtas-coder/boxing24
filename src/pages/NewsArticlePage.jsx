import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, User, AlertTriangle, Zap, Award, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { articles } from '../data/articles';
import { useAuth } from '../context/AuthContext';

const NewsArticlePage = () => {
    const { slug } = useParams();
    const [imageError, setImageError] = useState(false);
    const { isPremium } = useAuth();

    const { data: article, isLoading, error } = useQuery({
        queryKey: ['article', slug],
        queryFn: async () => {
            try {
                // 1. Try fetching from Supabase
                const { data, error } = await supabase
                    .from('news')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error("Supabase error:", error);
                    throw error;
                }

                if (data) {
                    return data;
                }

                // 2. Fallback: Expert Articles (Static Data)
                const foundArticle = articles.find(a => a.id === slug);
                if (foundArticle) {
                    return {
                        ...foundArticle,
                        slug: foundArticle.id,
                        image_url: foundArticle.image,
                        published_at: new Date().toISOString(),
                        // Return all content variants
                        content: foundArticle.content,
                        freeContent: foundArticle.freeContent,
                        premiumContent: foundArticle.premiumContent,
                        category: foundArticle.category || 'Wiedza Ekspercka',
                        author: foundArticle.author || 'Ekspert B24'
                    };
                }

                return null;
            } catch (err) {
                console.error("Fetch Error:", err);
                throw err;
            }
        },
        retry: false
    });

    // Dynamic SEO Meta Tags
    useEffect(() => {
        if (!article) return;
        const originalTitle = document.title;
        document.title = `${article.title} | Boxing24`;

        const setMeta = (property, content) => {
            let el = document.querySelector(`meta[property="${property}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute('property', property);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content || '');
        };

        setMeta('og:title', article.title);
        setMeta('og:description', article.excerpt || article.lead || '');
        setMeta('og:image', article.image_url || '');
        setMeta('og:url', `https://boxing24.pl/news/${slug}`);
        setMeta('og:type', 'article');

        let twitterCard = document.querySelector('meta[name="twitter:card"]');
        if (!twitterCard) {
            twitterCard = document.createElement('meta');
            twitterCard.setAttribute('name', 'twitter:card');
            document.head.appendChild(twitterCard);
        }
        twitterCard.setAttribute('content', 'summary_large_image');

        return () => { document.title = originalTitle; };
    }, [article, slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white pt-32 px-4 flex flex-col items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Błąd ładowania</h1>
                <p className="text-zinc-400 mb-6 text-center">
                    Wystąpił błąd podczas pobierania artykułu.<br />
                    <span className="text-xs font-mono text-red-900">{error.message}</span>
                </p>
                <Link to="/news" className="text-white hover:text-red-500 transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Wróć do aktualności
                </Link>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-black text-white pt-32 px-4 flex flex-col items-center">
                <h1 className="text-4xl font-black text-red-600 mb-4">404</h1>
                <p className="text-zinc-400 mb-8">Nie znaleziono artykułu.</p>
                <Link to="/news" className="text-white hover:text-red-500 transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Wróć do aktualności
                </Link>
            </div>
        );
    }

    const getArticleDate = () => {
        try {
            const dateStr = article.published_at || article.created_at;
            if (!dateStr) return new Date().toLocaleDateString();
            return new Date(dateStr).toLocaleDateString();
        } catch (e) {
            return "Data nieznana";
        }
    };

    const isExpertArticle = article.category && [
        'Wiedza Ekspercka', 'HISTORIA', 'DIETETYKA', 'BEZPIECZEŃSTWO',
        'TAKTYKA', 'PSYCHOLOGIA', 'NAUKA', 'RECOVERY', 'SCIENCE'
    ].includes(article.category);

    const hasValidImage = article.image_url && !imageError;

    // Content Selection Logic
    // If user is premium, prioritize premiumContent. 
    // If not premium, prioritize freeContent. 
    // Fallback to standard content.
    let contentToDisplay = article.content;
    let isLocked = false;

    if (article.hasDualVersion || (article.premiumContent && article.freeContent)) {
        if (isPremium) {
            contentToDisplay = article.premiumContent || article.premium_content || article.content;
        } else {
            contentToDisplay = article.freeContent || article.free_content || article.content;
            isLocked = true;
        }
    } else if (article.premiumContent) {
        // Just premium content exists
        if (isPremium) {
            contentToDisplay = article.premiumContent;
        } else {
            contentToDisplay = article.freeContent || article.content; // fallback
            isLocked = true;
        }
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20">
            <div className="w-full h-[60vh] relative bg-zinc-900 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

                {hasValidImage ? (
                    <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center relative">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                        <span className="text-zinc-700 text-6xl md:text-8xl font-black opacity-20 uppercase tracking-tighter select-none">
                            B24 NEWS
                        </span>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 w-full z-20 p-4 md:p-8 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-3">
                        <span className={`text-white text-[10px] md:text-xs font-bold uppercase tracking-widest px-2 py-1 ${isExpertArticle ? 'bg-blue-600' : 'bg-red-600'}`}>
                            {article.category || 'News'}
                        </span>
                        {isPremium && isExpertArticle && (
                            <span className="text-xs font-bold bg-amber-500 text-black px-2 py-1 uppercase tracking-widest flex items-center gap-1">
                                <Award className="w-3 h-3" /> Premium Access
                            </span>
                        )}
                    </div>
                    <h1 className="text-xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-4 max-w-5xl leading-tight drop-shadow-xl text-balance">
                        {article.title}
                    </h1>
                    <div className="flex items-center gap-6 text-zinc-300 text-xs md:text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-red-500" />
                            {getArticleDate()}
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-red-500" />
                            {article.author || article.author_name || 'Redakcja'}
                        </div>
                    </div>
                </div>
            </div>

            <article className="max-w-3xl mx-auto px-4 py-12">
                {(article.excerpt || article.lead) && (
                    <p className="text-xl md:text-2xl font-light leading-relaxed text-zinc-300 mb-12 border-l-4 border-red-600 pl-6 italic">
                        {article.excerpt || article.lead}
                    </p>
                )}

                <div
                    className="prose prose-invert prose-lg max-w-none text-zinc-300 prose-headings:text-red-500 prose-a:text-red-400 prose-strong:text-white"
                    dangerouslySetInnerHTML={{ __html: contentToDisplay || '<p>Brak treści.</p>' }}
                />

                {isExpertArticle && !isPremium && (
                    <div className="mt-16 bg-gradient-to-br from-zinc-900 to-black border border-blue-900/50 p-8 md:p-12 text-center rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/5 blur-[100px] pointer-events-none" />
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-4 uppercase italic relative z-10">
                            Chcesz Wiedzieć Więcej?
                        </h3>
                        <p className="text-zinc-400 mb-8 max-w-2xl mx-auto text-sm md:text-base relative z-10">
                            To tylko <span className="text-blue-500 font-bold">darmowy skrót</span> tego zagadnienia.
                            Dołącz do elity i trenuj świadomie.
                        </p>
                        <Link
                            to="/membership"
                            className="relative z-10 inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-full uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                        >
                            Odblokuj Pełną Wiedzę
                        </Link>
                    </div>
                )}

                {/* Universal CTA – Lead Generation */}
                <div className="mt-16 bg-gradient-to-br from-zinc-900 via-zinc-900 to-red-950/30 border border-red-900/30 p-8 md:p-12 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-shrink-0 p-4 bg-red-600/10 rounded-2xl border border-red-500/20">
                            <Zap className="w-10 h-10 text-red-500" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2">
                                Chcesz Trenować z Najlepszymi?
                            </h3>
                            <p className="text-zinc-400 text-sm md:text-base max-w-xl">
                                Treningi personalne we Wrocławiu pod okiem certyfikowanych trenerów Boxing24.
                                Biomechanika, taktyka, pełna analiza Twojego stylu.
                            </p>
                        </div>
                        <Link
                            to="/booking"
                            className="flex-shrink-0 bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-xl uppercase tracking-widest text-sm transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center gap-2"
                        >
                            <Award className="w-5 h-5" />
                            Umów Trening
                        </Link>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-800 flex justify-between items-center">
                    <Link to="/news" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Wróć do listy newsów
                    </Link>
                </div>
            </article>
        </div>
    );
};

export default NewsArticlePage;

import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { articles } from '../data/articles';

const NewsArticlePage = () => {
    const { slug } = useParams();

    const { data: article, isLoading, isError } = useQuery({
        queryKey: ['article', slug],
        queryFn: async () => {
            // 1. Try fetching from Supabase
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('slug', slug)
                .single();

            if (data) return data;

            // 2. Fallback: Expert Articles (Static Data)
            const foundArticle = articles.find(a => a.id === slug);
            if (foundArticle) {
                return {
                    ...foundArticle,
                    slug: foundArticle.id,
                    image_url: foundArticle.image,
                    published_at: new Date().toISOString(),
                    content: foundArticle.freeContent || foundArticle.content,
                    category: foundArticle.category || 'Wiedza Ekspercka',
                    author: foundArticle.author || 'Ekspert B24'
                };
            }

            return null;
        }
    });

    // View Tracking
    useEffect(() => {
        if (article && article.id && !article.is_article) { // Only track database news
            supabase.rpc('increment_view', {
                p_slug: slug,
                p_title: article.title
            }).catch(() => { });
        }
    }, [article, slug]);


    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
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

    // Check if it's an Expert Article (based on Category or Source)
    const isExpertArticle = [
        'Wiedza Ekspercka', 'HISTORIA', 'DIETETYKA', 'BEZPIECZEŃSTWO',
        'TAKTYKA', 'PSYCHOLOGIA', 'NAUKA', 'RECOVERY'
    ].includes(article.category);

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20">
            {/* Hero Image */}
            <div className="w-full h-[60vh] relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full z-20 p-4 md:p-12 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <span className={`text-white text-xs font-bold uppercase tracking-widest px-3 py-1 ${isExpertArticle ? 'bg-blue-600' : 'bg-red-600'
                            }`}>
                            {article.category}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 max-w-4xl leading-none">
                        {article.title}
                    </h1>
                    <div className="flex items-center gap-6 text-zinc-400 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.published_at || article.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {article.author || article.author_name}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <article className="max-w-3xl mx-auto px-4 py-12">
                <p className="text-xl md:text-2xl font-light leading-relaxed text-zinc-300 mb-12 border-l-4 border-red-600 pl-6 italic">
                    {article.excerpt || article.lead}
                </p>

                <div
                    className="prose prose-invert prose-lg max-w-none text-zinc-300 [&>h3]:text-red-500 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-4 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>li]:mb-2"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* PREMIUM CTA - Only for Expert Articles */}
                {isExpertArticle && (
                    <div className="mt-16 bg-gradient-to-br from-zinc-900 to-black border border-blue-900/50 p-8 md:p-12 text-center rounded-2xl relative overflow-hidden group">
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/5 blur-[100px] pointer-events-none" />

                        <h3 className="text-2xl md:text-3xl font-black text-white mb-4 uppercase italic relative z-10">
                            Chcesz Wiedzieć Więcej?
                        </h3>
                        <p className="text-zinc-400 mb-8 max-w-2xl mx-auto text-sm md:text-base relative z-10">
                            To tylko <span className="text-blue-500 font-bold">darmowy skrót</span> tego zagadnienia.
                            Pełna analiza, szczegółowe plany treningowe, materiały wideo i konsultacje z ekspertami dostępne są wyłącznie w pakiecie <span className="text-white font-bold">PREMIUM</span>.
                            Dołącz do elity i trenuj świadomie.
                        </p>

                        <Link
                            to="/pricing"
                            className="relative z-10 inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-full uppercase tracking-widest transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                        >
                            Odblokuj Pełną Wiedzę
                        </Link>
                    </div>
                )}

                <div className="mt-16 pt-8 border-t border-zinc-800 flex justify-between items-center">
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

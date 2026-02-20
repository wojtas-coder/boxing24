import React, { useState, useEffect } from 'react';
import { supabaseData as supabase } from '../../lib/supabaseClient';
import { RefreshCw, Plus, Trash2, Edit, Wand2, Search, ImageOff, ExternalLink } from 'lucide-react';
import NewsEditor from '../../components/news/NewsEditor';
import NewsReformatter from '../../components/news/NewsReformatter';
import { Link } from 'react-router-dom';

const AdminNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isReformatterOpen, setIsReformatterOpen] = useState(false);
    const [currentArticle, setCurrentArticle] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchErr } = await supabase
                .from('news')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchErr) throw fetchErr;
            setNews(data || []);
        } catch (err) {
            console.error("Error fetching news:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFormattedNews = (articleData) => {
        // AI returned a formatted article. Open editor with this data.
        setCurrentArticle(articleData);
        setIsEditorOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Czy na pewno chcesz bezpowrotnie usunąć ten artykuł?')) return;
        try {
            const { error } = await supabase.from('news').delete().eq('id', id);
            if (error) throw error;
            // Optimistic update
            setNews(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            alert("Błąd usuwania: " + error.message);
        }
    };

    const filteredNews = news.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen text-white">
            {/* Header Toolbar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-zinc-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
                        News<span className="text-red-600">room</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                        Panel Zarządzania Treścią
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Szukaj newsa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-xl focus:border-red-600 outline-none transition-colors text-sm"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsReformatterOpen(true)}
                            className="px-4 py-3 font-bold flex items-center gap-2 rounded-xl transition-all shadow-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/5"
                            title="AI Asystent"
                        >
                            <Wand2 className="w-4 h-4" />
                            <span className="hidden md:inline">AI Asystent</span>
                        </button>

                        <button
                            onClick={() => { setCurrentArticle(null); setIsEditorOpen(true); }}
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 font-bold flex items-center gap-2 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all uppercase tracking-wider text-sm"
                        >
                            <Plus className="w-5 h-5" /> Dodaj News
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Modal */}
            <NewsReformatter
                isOpen={isReformatterOpen}
                onClose={() => setIsReformatterOpen(false)}
                onFormatted={handleFormattedNews}
            />

            {/* Editor Modal */}
            {isEditorOpen && (
                <NewsEditor
                    article={currentArticle}
                    onClose={() => { setIsEditorOpen(false); setCurrentArticle(null); }}
                    onSave={() => {
                        fetchNews();
                    }}
                />
            )}

            {/* Content Area */}
            <div className="space-y-4">
                {error && (
                    <div className="p-6 text-center text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 flex flex-col items-center">
                        <h3 className="font-bold mb-2">Wystąpił błąd podczas pobierania</h3>
                        <p className="text-sm font-mono mb-4">{error}</p>
                        <button onClick={() => { setError(null); fetchNews(); }} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Spróbuj ponownie
                        </button>
                    </div>
                )}

                {loading && news.length === 0 && !error ? (
                    <div className="flex justify-center py-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4">
                            {filteredNews.map(item => (
                                <div key={item.id} className="group bg-zinc-900/30 hover:bg-zinc-900/60 p-4 border border-white/5 hover:border-white/10 rounded-2xl transition-all backdrop-blur-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-150"></div>

                                    {/* Image Thumbnail */}
                                    <div className="relative w-full md:w-48 h-32 bg-black rounded-xl overflow-hidden shadow-lg border border-white/5 shrink-0">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=Błąd+Zdjecia';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-zinc-900">
                                                <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                                                <span className="text-[10px] font-bold uppercase">Brak zdjęcia</span>
                                            </div>
                                        )}
                                        {item.is_breaking && (
                                            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded shadow-lg">
                                                Breaking
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-zinc-300 border border-white/5">
                                                    {item.category}
                                                </span>
                                                <span className="text-zinc-500 text-xs font-mono">
                                                    {new Date(item.created_at).toLocaleDateString('pl-PL')}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors mb-2 line-clamp-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed mb-3">
                                                {item.lead || "Brak zajawki..."}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
                                            <div className="flex items-center gap-1.5" title="Autor">
                                                <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                                                {item.author_name || 'Redakcja'}
                                            </div>
                                            <a href={`/news/${item.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors" title="Zobacz na stronie">
                                                <ExternalLink className="w-3 h-3" /> /{item.slug}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-4">
                                        <button
                                            onClick={() => { setCurrentArticle(item); setIsEditorOpen(true); }}
                                            className="flex-1 md:flex-none p-3 bg-zinc-800 hover:bg-white hover:text-black rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                                            title="Edytuj"
                                        >
                                            <Edit className="w-4 h-4" />
                                            <span className="md:hidden text-xs font-bold uppercase">Edytuj</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="flex-1 md:flex-none p-3 bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2"
                                            title="Usuń"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="md:hidden text-xs font-bold uppercase">Usuń</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!loading && filteredNews.length === 0 && (
                            <div className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5">
                                    <Search className="w-8 h-8 text-zinc-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Brak wyników</h3>
                                <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                                    {searchTerm ? `Nie znaleziono newsów dla frazy "${searchTerm}"` : "Twoja baza newsów jest pusta."}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={() => { setCurrentArticle(null); setIsEditorOpen(true); }}
                                        className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all uppercase tracking-wider text-xs"
                                    >
                                        Stwórz Pierwszy News
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminNews;

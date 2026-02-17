import React, { useState, useEffect } from 'react';
import { supabaseData as supabase } from '../../lib/supabaseClient';
import { RefreshCw, Plus, Trash2, Edit, Wand2 } from 'lucide-react';
import NewsEditor from '../../components/news/NewsEditor';
import NewsReformatter from '../../components/news/NewsReformatter';

const AdminNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isReformatterOpen, setIsReformatterOpen] = useState(false);
    const [currentArticle, setCurrentArticle] = useState(null);

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
        if (!window.confirm('Usunąć ten artykuł?')) return;
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (!error) fetchNews();
        else alert("Błąd usuwania: " + error.message);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                        News<span className="text-red-600">room</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Zarządzanie Aktualnościami</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsReformatterOpen(true)}
                        className="px-6 py-3 font-bold flex items-center gap-2 rounded-xl transition-all shadow-lg bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20 hover:shadow-purple-500/40"
                    >
                        <Wand2 className="w-4 h-4" />
                        AI Asystent
                    </button>

                    <button
                        onClick={() => { setCurrentArticle(null); setIsEditorOpen(true); }}
                        className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 font-bold flex items-center gap-2 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all"
                    >
                        <Plus className="w-4 h-4" /> Dodaj News
                    </button>
                </div>
            </div>

            <NewsReformatter
                isOpen={isReformatterOpen}
                onClose={() => setIsReformatterOpen(false)}
                onFormatted={handleFormattedNews}
            />

            {isEditorOpen && (
                <NewsEditor
                    article={currentArticle}
                    onClose={() => { setIsEditorOpen(false); setCurrentArticle(null); }}
                    onSave={() => {
                        fetchNews();
                    }}
                />
            )}

            <div className="grid gap-4">
                {error && (
                    <div className="p-6 text-center text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
                        <h3 className="font-bold mb-2">Błąd pobierania newsów</h3>
                        <p className="text-sm font-mono">{error}</p>
                        <button onClick={() => { setError(null); fetchNews(); }} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Spróbuj ponownie</button>
                    </div>
                )}
                {loading && news.length === 0 && !error ? (
                    <div className="text-center py-20 text-zinc-500 animate-pulse">Ładowanie bazy newsów...</div>
                ) : (
                    <>
                        {news.map(item => (
                            <div key={item.id} className="bg-zinc-900/50 p-4 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-white/20 transition-all rounded-xl backdrop-blur-sm gap-4">
                                <div className="flex gap-4 items-center w-full">
                                    <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-black border border-zinc-700">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs">NO IMG</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {item.is_breaking && <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Breaking</span>}
                                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{item.category}</span>
                                        </div>
                                        <h3 className="font-bold text-xl text-white group-hover:text-red-500 transition-colors truncate pr-4">{item.title}</h3>
                                        <p className="text-zinc-500 text-xs mt-1">
                                            Slug: <span className="font-mono text-zinc-600">{item.slug}</span> |
                                            Data: <span className="text-zinc-400">{new Date(item.created_at).toLocaleDateString()}</span> |
                                            Autor: <span className="text-zinc-400">{item.author_name || item.author}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto justify-end">
                                    <button
                                        onClick={() => { setCurrentArticle(item); setIsEditorOpen(true); }}
                                        className="px-4 py-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                    >
                                        <Edit size={16} /> Edytuj
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-3 py-2 text-red-900 hover:text-red-500 hover:bg-red-900/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {!loading && news.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                        <p className="text-zinc-500 mb-2">Baza danych jest pusta.</p>
                        <p className="text-zinc-600 text-sm">Kliknij "Dodaj News", aby rozpocząć.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminNews;

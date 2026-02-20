import React, { useState, useEffect } from 'react';
import { supabaseData as supabase } from '../../lib/supabaseClient';
import { RefreshCw, Plus, Trash2, Edit, Search, ImageOff, ExternalLink, GraduationCap, Star, Database } from 'lucide-react';
import KnowledgeEditor from '../../components/knowledge/KnowledgeEditor';

const AdminKnowledge = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentArticle, setCurrentArticle] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchErr } = await supabase
                .from('knowledge_articles')
                .select('*')
                .order('created_at', { ascending: false });

            // If table doesn't exist yet, it throws an error. We handle it gracefully for first run.
            if (fetchErr && fetchErr.code !== '42P01') throw fetchErr;
            if (fetchErr && fetchErr.code === '42P01') {
                setError('Tabela knowledge_articles nie istnieje. Uruchom skrypt SQL: supabase_knowledge.sql w panelu administratora bazy danych.');
                setLoading(false);
                return;
            }

            setArticles(data || []);
        } catch (err) {
            console.error("Error fetching knowledge articles:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Czy na pewno chcesz bezpowrotnie usunąć ten artykuł edukacyjny?')) return;
        try {
            const { error } = await supabase.from('knowledge_articles').delete().eq('id', id);
            if (error) throw error;
            setArticles(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            alert("Błąd usuwania: " + error.message);
        }
    };

    const handleMigrate = async () => {
        if (!window.confirm('UWAGA: Ta opcja skopiuje na sztywno stare artykuły z plików na dysku do bazy danych. Spowoduje to nadpisanie (lub zduplikowanie) wpisów, jeśli zrobisz to drugi raz. Kontynuować?')) return;
        setLoading(true);
        try {
            const { articles: localArticles } = await import('../../data/articles.js');
            let toInsert = localArticles.map(a => ({
                title: a.title || 'Bez tytułu',
                slug: (a.id || Date.now().toString()),
                excerpt: a.excerpt || '',
                content: a.content || '<p>Brak treści</p>',
                category: a.category || 'Trening',
                image_url: a.image || '',
                author_name: 'Redakcja',
                is_premium: !!a.isPremium,
                difficulty_level: a.difficulty || 'Początkujący'
            }));

            // In Supabase, inserting multiple rows in one query
            const { error } = await supabase.from('knowledge_articles').upsert(toInsert, { onConflict: 'slug' });
            if (error) throw error;

            alert('Migracja przebiegła pomyślnie! Odświeżam listę...');
            fetchArticles();
        } catch (err) {
            console.error('Migration failed:', err);
            alert('Błąd podczas migracji: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredArticles = articles.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen text-white">
            {/* Header Toolbar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-zinc-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
                        Strefa <span className="text-boxing-green">Wiedzy</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <span className="w-2 h-2 bg-boxing-green rounded-full animate-pulse"></span>
                        Zarządzanie Edukacją & Kompendium
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Szukaj artykułu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-xl focus:border-boxing-green outline-none transition-colors text-sm"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleMigrate}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 font-bold flex items-center gap-2 rounded-xl transition-all tracking-wider text-xs border border-zinc-700"
                            title="Wczytaj artykuły ze starej strony, aby móc je tutaj edytować"
                        >
                            <Database className="w-4 h-4" /> <span className="hidden md:inline">Wczytaj Obecne Artykuły z Boksopedii</span>
                        </button>
                        <button
                            onClick={() => { setCurrentArticle(null); setIsEditorOpen(true); }}
                            className="bg-boxing-green hover:bg-[#b0f020] text-black px-6 py-3 font-bold flex items-center gap-2 rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all uppercase tracking-wider text-sm"
                        >
                            <Plus className="w-5 h-5" /> Dodaj Artykuł
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor Modal */}
            {isEditorOpen && (
                <KnowledgeEditor
                    article={currentArticle}
                    onClose={() => { setIsEditorOpen(false); setCurrentArticle(null); }}
                    onSave={() => {
                        fetchArticles();
                    }}
                />
            )}

            {/* Content Area */}
            <div className="space-y-4">
                {error && (
                    <div className="p-6 text-center text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 flex flex-col items-center">
                        <h3 className="font-bold mb-2">Wystąpił błąd</h3>
                        <p className="text-sm font-mono mb-4">{error}</p>
                        <button onClick={() => { setError(null); fetchArticles(); }} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Spróbuj ponownie
                        </button>
                    </div>
                )}

                {loading && articles.length === 0 && !error ? (
                    <div className="flex justify-center py-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-boxing-green"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4">
                            {filteredArticles.map(item => (
                                <div key={item.id} className="group bg-zinc-900/30 hover:bg-zinc-900/60 p-4 border border-white/5 hover:border-white/10 rounded-2xl transition-all backdrop-blur-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-boxing-green/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-150"></div>

                                    {/* Image Thumbnail */}
                                    <div className="relative w-full md:w-32 h-24 bg-black rounded-xl overflow-hidden shadow-lg border border-white/5 shrink-0">
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
                                                <GraduationCap className="w-8 h-8 mb-2 opacity-30" />
                                            </div>
                                        )}
                                        {item.is_premium && (
                                            <div className="absolute top-1 left-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1">
                                                <Star className="w-2 h-2 fill-current" /> Premium
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-boxing-green">
                                                    {item.category}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                                <span className="text-zinc-500 text-[10px] font-mono uppercase">
                                                    Poziom: {item.difficulty_level || 'Początkujący'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-boxing-green transition-colors mb-1 line-clamp-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                                                {item.excerpt || "Brak zajawki..."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-4">
                                        <button
                                            onClick={() => { setCurrentArticle(item); setIsEditorOpen(true); }}
                                            className="flex-1 md:flex-none p-3 bg-zinc-800 hover:bg-white hover:text-black rounded-xl transition-all flex items-center justify-center gap-2"
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

                        {!loading && filteredArticles.length === 0 && (
                            <div className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5">
                                    <GraduationCap className="w-8 h-8 text-zinc-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Brak Wyników</h3>
                                <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                                    {searchTerm ? `Nie znaleziono artykułów dla frazy "${searchTerm}"` : "Baza wiedzy jest obecnie pusta."}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={() => { setCurrentArticle(null); setIsEditorOpen(true); }}
                                        className="px-8 py-3 bg-boxing-green hover:bg-[#b0f020] text-black font-bold rounded-xl shadow-lg transition-all uppercase tracking-wider text-xs"
                                    >
                                        Stwórz Pierwszy Artykuł
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

export default AdminKnowledge;

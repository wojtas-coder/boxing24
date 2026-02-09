import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Save, Trash2, Plus, Image as ImageIcon, RefreshCw, ArrowLeft } from 'lucide-react';

const AdminPage = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentArticle, setCurrentArticle] = useState(null);
    const navigate = useNavigate();

    // 1. Auth Check - DEBUG VERSION
    useEffect(() => {
        console.log("🔍 Checking Supabase Auth...");
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("❌ Auth Error:", error);
                alert("Błąd połączenia z bazą: " + error.message);
            }
            console.log("✅ Session:", session);
            setSession(session);
            if (session) fetchNews();
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchNews();
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Fetch News (Hybrid: JSON + Supabase would be ideal, but for CRUD we focuse on Supabase or just visualizing JSON if possible. 
    //    Actually, we can ONLY edit Supabase news here nicely. JSON news are "readonly" updates by bot.
    //    Let's focus on managing the "Manual" news override table.)
    const fetchNews = async () => {
        // Fetch from Supabase 'news' table
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('published_at', { ascending: false });

        if (data) setNews(data);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert('Błąd logowania: ' + error.message);
    };

    const handleSave = async () => {
        if (!currentArticle.title || !currentArticle.slug) return alert('Tytuł i Slug są wymagane');

        const payload = {
            ...currentArticle,
            published_at: currentArticle.published_at || new Date().toISOString(),
            author: currentArticle.author || 'Redakcja Manualna'
        };

        let error;
        if (currentArticle.id) {
            // Update
            const { error: err } = await supabase.from('news').update(payload).eq('id', currentArticle.id);
            error = err;
        } else {
            // Insert
            const { error: err } = await supabase.from('news').insert([payload]);
            error = err;
        }

        if (error) {
            alert('Błąd zapisu: ' + error.message);
        } else {
            setIsEditing(false);
            setCurrentArticle(null);
            fetchNews();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Na pewno usunąć?')) return;
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (!error) fetchNews();
    };

    if (loading) return <div className="min-h-screen bg-black text-white p-10 flex items-center justify-center">Ładowanie panelu...</div>;

    if (!session) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-8">
                        <ArrowLeft className="cursor-pointer hover:text-red-500 transition-colors" onClick={() => navigate('/')} />
                    </div>
                    <form onSubmit={handleLogin} className="bg-zinc-900 p-8 border border-zinc-800 space-y-4 shadow-2xl rounded-xl">
                        <h1 className="text-2xl font-black mb-6 text-center text-white uppercase tracking-tighter">Command <span className="text-red-600">Center</span></h1>
                        <input name="email" type="email" placeholder="Email Redaktora" className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none transition-colors" />
                        <input name="password" type="password" placeholder="Hasło" className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none transition-colors" />
                        <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold p-3 uppercase tracking-wider rounded transition-transform active:scale-95">
                            Zaloguj
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Panel <span className="text-red-600">Redakcyjny</span></h1>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/')} className="text-zinc-500 hover:text-white transition-colors">Wróć na stronę</button>
                        <button onClick={() => supabase.auth.signOut()} className="text-red-600 hover:text-red-500 font-bold border border-red-600 px-4 py-1 rounded hover:bg-red-600/10 transition-colors">Wyloguj</button>
                    </div>
                </div>

                {/* Editor Modal / Form */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-zinc-900 border border-zinc-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl rounded-xl">
                            <h2 className="text-xl font-bold mb-4 text-white">{currentArticle.id ? 'Edytuj News' : 'Nowy News'}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input
                                    value={currentArticle.title}
                                    onChange={e => setCurrentArticle({ ...currentArticle, title: e.target.value })}
                                    placeholder="Tytuł (Clickbait)"
                                    className="bg-black border border-zinc-700 p-3 text-white w-full rounded focus:border-blue-500 outline-none"
                                />
                                <input
                                    value={currentArticle.slug}
                                    onChange={e => setCurrentArticle({ ...currentArticle, slug: e.target.value })}
                                    placeholder="Slug (url-friendly)"
                                    className="bg-black border border-zinc-700 p-3 text-white w-full rounded focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div className="mb-4">
                                <textarea
                                    value={currentArticle.excerpt}
                                    onChange={e => setCurrentArticle({ ...currentArticle, excerpt: e.target.value })}
                                    placeholder="Krótki opis (Excerpt)"
                                    className="bg-black border border-zinc-700 p-3 text-white w-full h-24 rounded focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div className="mb-4">
                                <textarea
                                    value={currentArticle.content}
                                    onChange={e => setCurrentArticle({ ...currentArticle, content: e.target.value })}
                                    placeholder="Treść HTML (<b>, <br>, etc.)"
                                    className="bg-black border border-zinc-700 p-3 text-white w-full h-64 font-mono text-sm rounded focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <input
                                    value={currentArticle.image_url}
                                    onChange={e => setCurrentArticle({ ...currentArticle, image_url: e.target.value })}
                                    placeholder="URL Obrazka"
                                    className="bg-black border border-zinc-700 p-3 text-white w-full rounded focus:border-blue-500 outline-none"
                                />
                                <input
                                    value={currentArticle.category}
                                    onChange={e => setCurrentArticle({ ...currentArticle, category: e.target.value })}
                                    placeholder="Kategoria (np. WROCŁAW)"
                                    className="bg-black border border-zinc-700 p-3 text-white w-full rounded focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-zinc-400 hover:text-white transition-colors">Anuluj</button>
                                <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white px-8 py-2 font-bold flex items-center gap-2 rounded transition-transform active:scale-95">
                                    <Save className="w-4 h-4" /> Zapisz
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* News List */}
                <div className="mb-8 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-zinc-400">Twoje Artykuły (Baza Danych)</h2>
                    <button
                        onClick={() => {
                            setCurrentArticle({ title: '', slug: '', excerpt: '', content: '', image_url: '', category: 'NEWS' });
                            setIsEditing(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 font-bold flex items-center gap-2 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all"
                    >
                        <Plus className="w-4 h-4" /> Dodaj News
                    </button>
                </div>

                <div className="grid gap-4">
                    {news.map(item => (
                        <div key={item.id} className="bg-zinc-900 p-4 border border-zinc-800 flex justify-between items-center group hover:border-zinc-600 transition-colors rounded-lg">
                            <div className="flex gap-4 items-center">
                                <img src={item.image_url} alt="" className="w-16 h-16 object-cover bg-black rounded" />
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                    <p className="text-zinc-500 text-xs">{new Date(item.published_at).toLocaleString()} | <span className="text-zinc-300">{item.category}</span></p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setCurrentArticle(item); setIsEditing(true); }}
                                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                                >
                                    Edytuj
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-red-900 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {news.length === 0 && (
                        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
                            <p className="text-zinc-500 mb-2">Baza danych jest pusta.</p>
                            <p className="text-zinc-600 text-sm">Bot automatyczny zapisuje newsy w pliku JSON.<br />Tutaj możesz dodawać newsy "Ręczne" (Breaking News), które nadpiszą automat.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;

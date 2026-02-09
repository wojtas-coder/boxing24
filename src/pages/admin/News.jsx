import { generateDailyNews } from '../../utils/aiEditor';

const AdminNews = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentArticle, setCurrentArticle] = useState(null);
    const [generating, setGenerating] = useState(false);

    // ... (rest of useEffect as before)

    const handleGenerate = async () => {
        if (!window.confirm("Czy na pewno chcesz wygenerować nowe newsy przez AI?")) return;
        setGenerating(true);
        const result = await generateDailyNews();
        setGenerating(false);

        if (result.success) {
            alert(`Sukces! Dodano ${result.count} nowych artykułów.`);
            fetchNews();
        } else {
            alert(`Błąd generatora: ${result.error}`);
        }
    };

    // ... (fetchNews, handleSave, handleDelete remain similar but ensure correct state)
    useEffect(() => {
        let mounted = true;

        // Safety Unlock Mechanism
        const timer = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Newsroom loading timed out - forcing unlock");
                setLoading(false);
            }
        }, 1000);

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            setSession(session);
            if (session) {
                fetchNews().finally(() => {
                    if (mounted) setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        return () => { mounted = false; clearTimeout(timer); };
    }, []);

    const fetchNews = async () => {
        const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false });
        if (data) setNews(data);
    };

    const handleSave = async () => {
        if (!currentArticle.title || !currentArticle.slug) return alert('Tytuł i Slug są wymagane');
        const payload = { ...currentArticle, published_at: currentArticle.published_at || new Date().toISOString(), author: currentArticle.author || 'Redakcja' };

        const request = currentArticle.id
            ? supabase.from('news').update(payload).eq('id', currentArticle.id)
            : supabase.from('news').insert([payload]);

        const { error } = await request;
        if (error) alert('Błąd: ' + error.message);
        else { setIsEditing(false); setCurrentArticle(null); fetchNews(); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Usunąć?')) return;
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (!error) fetchNews();
    };

    if (loading) return <div>Ładowanie...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                        News<span className="text-red-600">room</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Zarządzanie Aktualnościami</p>
                </div>
            </div>

            {/* Editor Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl rounded-xl">
                        <h2 className="text-xl font-bold mb-4 text-white">{currentArticle.id ? 'Edytuj News' : 'Nowy News'}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input value={currentArticle.title} onChange={e => setCurrentArticle({ ...currentArticle, title: e.target.value })} placeholder="Tytuł" className="bg-black border border-zinc-700 p-3 text-white w-full rounded focus:border-red-600 outline-none" />
                            <input value={currentArticle.slug} onChange={e => setCurrentArticle({ ...currentArticle, slug: e.target.value })} placeholder="Slug" className="bg-black border border-zinc-700 p-3 text-white w-full rounded focus:border-red-600 outline-none" />
                        </div>

                        <div className="mb-4">
                            <textarea value={currentArticle.excerpt} onChange={e => setCurrentArticle({ ...currentArticle, excerpt: e.target.value })} placeholder="Krótki opis" className="bg-black border border-zinc-700 p-3 text-white w-full h-24 rounded focus:border-red-600 outline-none" />
                        </div>

                        <div className="mb-4">
                            <textarea value={currentArticle.content} onChange={e => setCurrentArticle({ ...currentArticle, content: e.target.value })} placeholder="Treść HTML" className="bg-black border border-zinc-700 p-3 text-white w-full h-64 font-mono text-sm rounded focus:border-red-600 outline-none" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <input value={currentArticle.image_url} onChange={e => setCurrentArticle({ ...currentArticle, image_url: e.target.value })} placeholder="URL Obrazka" className="bg-black border border-zinc-700 p-3 text-white w-full rounded focus:border-red-600 outline-none" />
                            <input value={currentArticle.category} onChange={e => setCurrentArticle({ ...currentArticle, category: e.target.value })} placeholder="Kategoria" className="bg-black border border-zinc-700 p-3 text-white w-full rounded focus:border-red-600 outline-none" />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-zinc-400 hover:text-white transition-colors">Anuluj</button>
                            <button onClick={handleSave} className="bg-red-600 hover:bg-red-500 text-white px-8 py-2 font-bold flex items-center gap-2 rounded transition-transform active:scale-95">
                                <Save className="w-4 h-4" /> Zapisz
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="mb-8 flex justify-end gap-4">
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className={`px-6 py-3 font-bold flex items-center gap-2 rounded-xl transition-all shadow-lg
                        ${generating ? 'bg-zinc-800 text-zinc-500' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20 hover:shadow-purple-500/40'}
                    `}
                >
                    <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                    {generating ? 'Generowanie...' : 'AI Autopilot'}
                </button>

                <button
                    onClick={() => { setCurrentArticle({ title: '', slug: '', excerpt: '', content: '', image_url: '', category: 'NEWS' }); setIsEditing(true); }}
                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 font-bold flex items-center gap-2 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all"
                >
                    <Plus className="w-4 h-4" /> Dodaj News
                </button>
            </div>

            <div className="grid gap-4">
                {news.map(item => (
                    <div key={item.id} className="bg-zinc-900/50 p-4 border border-white/5 flex justify-between items-center group hover:border-white/20 transition-all rounded-xl backdrop-blur-sm">
                        <div className="flex gap-4 items-center">
                            <img src={item.image_url} alt="" className="w-16 h-16 object-cover bg-black rounded-lg" />
                            <div>
                                <h3 className="font-bold text-lg text-white group-hover:text-red-500 transition-colors">{item.title}</h3>
                                <p className="text-zinc-500 text-xs">{new Date(item.published_at).toLocaleString()} | <span className="text-zinc-300">{item.category}</span></p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setCurrentArticle(item); setIsEditing(true); }} className="p-2 text-zinc-400 hover:text-white transition-colors">Edytuj</button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminNews;

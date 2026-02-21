import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
    Star, Plus, Trash2, Edit2, Save, X,
    MessageSquare, User, ShieldCheck, Eye,
    EyeOff, RefreshCw, AlertCircle, CheckCircle2,
    Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        author_name: '',
        author_role: '',
        content: '',
        rating: 5,
        avatar_url: '',
        is_active: true,
        order_index: 0
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data, error: fetchErr } = await supabase
                .from('reviews')
                .select('*')
                .order('order_index', { ascending: true });

            if (fetchErr) throw fetchErr;
            setReviews(data || []);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError(`Błąd pobierania opinii: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditor = (review = null) => {
        if (review) {
            setEditingReview(review);
            setFormData({
                author_name: review.author_name,
                author_role: review.author_role || '',
                content: review.content,
                rating: review.rating,
                avatar_url: review.avatar_url || '',
                is_active: review.is_active,
                order_index: review.order_index
            });
        } else {
            setEditingReview(null);
            setFormData({
                author_name: '',
                author_role: '',
                content: '',
                rating: 5,
                avatar_url: '',
                is_active: true,
                order_index: reviews.length
            });
        }
        setIsEditorOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (editingReview) {
                const { error: updateErr } = await supabase
                    .from('reviews')
                    .update(formData)
                    .eq('id', editingReview.id);
                if (updateErr) throw updateErr;
                setSuccess("Opinia zaktualizowana pomyślnie");
            } else {
                const { error: insertErr } = await supabase
                    .from('reviews')
                    .insert([formData]);
                if (insertErr) throw insertErr;
                setSuccess("Nowa opinia została dodana");
            }

            fetchReviews();
            setIsEditorOpen(false);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Error saving review:", err);
            setError(`Błąd zapisu: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tę opinię?")) return;

        try {
            const { error: delErr } = await supabase
                .from('reviews')
                .delete()
                .eq('id', id);

            if (delErr) throw delErr;
            setSuccess("Opinia została usunięta");
            fetchReviews();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Error deleting review:", err);
            setError(`Błąd usuwania: ${err.message}`);
        }
    };

    const handleSeedDefaults = async () => {
        setSaving(true);
        setError(null);
        try {
            const defaultTestimonials = [
                {
                    author_name: "Marek Wiśniewski",
                    author_role: "Zawodnik Muay Thai",
                    content: "System Boxing24 całkowicie zmienił moje podejście do przygotowań. Analiza danych pozwoliła mi wyeliminować błędy w gardzie, których nie widziałem przez lata.",
                    rating: 5,
                    avatar_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
                    is_active: true,
                    order_index: 0
                },
                {
                    author_name: "Katarzyna Kowalska",
                    author_role: "Członek VIP",
                    content: "Treningi personalne pod okiem Wojciecha to inna liga. Pełen profesjonalizm i luksusowe podejście do klienta. Efekty przyszły szybciej niż się spodziewałam.",
                    rating: 5,
                    avatar_url: "https://images.unsplash.com/photo-1548690312-e3b507d17a4d?q=80&w=1974&auto=format&fit=crop",
                    is_active: true,
                    order_index: 1
                },
                {
                    author_name: "Adam Nowak",
                    author_role: "Początkujący",
                    content: "Bałem się wejść na salę, ale ekipa Boxing24 sprawiła, że czuję się tam jak w domu. Połączenie technologii z pasją robi niesamowite wrażenie.",
                    rating: 5,
                    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop",
                    is_active: true,
                    order_index: 2
                }
            ];

            const { error: seedErr } = await supabase.from('reviews').insert(defaultTestimonials);
            if (seedErr) throw seedErr;

            setSuccess("Zainicjalizowano 3 domyślne opinie!");
            fetchReviews();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Error seeding reviews:", err);
            setError(`Błąd inicjalizacji: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen text-white pb-20">
            {/* Header Area */}
            <div className="relative overflow-hidden bg-zinc-900/50 p-8 md:p-12 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            <ShieldCheck className="w-3 h-3" /> System Dowodów Społecznych
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">
                            Opinie <span className="text-red-600">Klientów</span>
                        </h1>
                        <p className="text-zinc-500 font-medium text-sm md:text-base max-w-xl">
                            Zarządzaj świadectwami sukcesu swoich podopiecznych. Każda opinia to cegiełka budująca prestiż marki Boxing24.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => fetchReviews()}
                            className="p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 transition-all text-zinc-400 hover:text-white"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => handleOpenEditor()}
                            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> Nowa Opinia
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                    {[
                        { label: 'Wszystkie', value: reviews.length, icon: MessageSquare },
                        { label: 'Widoczne', value: reviews.filter(r => r.is_active).length, icon: Eye },
                        { label: 'Ukryte', value: reviews.filter(r => !r.is_active).length, icon: EyeOff },
                        { label: 'Średnia', value: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0', icon: Star },
                    ].map((stat, i) => (
                        <div key={stat.label} className="bg-black/40 p-6 rounded-3xl border border-white/5">
                            <stat.icon className="w-5 h-5 text-red-600 mb-2" />
                            <div className="text-2xl font-black text-white">{stat.value}</div>
                            <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notifications */}
            {success && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 p-4 rounded-2xl text-green-500 text-sm font-bold">
                    <CheckCircle2 className="w-5 h-5" /> {success}
                </motion.div>
            )}
            {error && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500 text-sm font-bold">
                    <AlertCircle className="w-5 h-5" /> {error}
                </motion.div>
            )}

            {/* Empty State / Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                    <RefreshCw className="w-12 h-12 animate-spin text-red-600 mb-4" />
                    <p className="font-black uppercase tracking-widest text-zinc-500">Synchronizacja danych...</p>
                </div>
            ) : reviews.length === 0 ? (
                <div className="bg-zinc-900/30 border-2 border-dashed border-white/5 rounded-[3rem] p-20 text-center">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Quote className="w-10 h-10 text-zinc-600" />
                    </div>
                    <h3 className="text-2xl font-black uppercase italic mb-4">Twoja ściana chwały jest pusta</h3>
                    <p className="text-zinc-500 max-w-md mx-auto mb-8 font-medium">Nie masz jeszcze żadnych opinii w bazie danych. Możesz dodać pierwszą ręcznie lub zainstalować paczkę startową.</p>
                    <button
                        onClick={handleSeedDefaults}
                        disabled={saving}
                        className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Generowanie...' : 'Zainicjalizuj 3 Opinie Domyślne'}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {reviews.map((review) => (
                        <motion.div
                            layout
                            key={review.id}
                            className={`group relative bg-zinc-900/50 rounded-[2rem] border border-white/5 overflow-hidden transition-all hover:border-red-600/30 ${!review.is_active ? 'opacity-50 grayscale' : ''}`}
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-red-500 fill-red-500' : 'text-zinc-700'}`} />
                                        ))}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenEditor(review)} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(review.id)} className="p-2 bg-zinc-800 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <blockquote className="text-zinc-300 text-lg mb-8 italic">
                                    "{review.content}"
                                </blockquote>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-600/20 bg-zinc-800">
                                        {review.avatar_url ? (
                                            <img src={review.avatar_url} alt={review.author_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                <User className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-black uppercase tracking-tighter">{review.author_name}</div>
                                        <div className="text-[10px] text-red-600 font-bold uppercase tracking-widest">{review.author_role}</div>
                                    </div>
                                </div>
                            </div>

                            {!review.is_active && (
                                <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 text-[8px] font-black uppercase tracking-widest rounded text-zinc-500 border border-white/5">
                                    Ukryty na stronie
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Editor Modal */}
            <AnimatePresence>
                {isEditorOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditorOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-zinc-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
                        >
                            <form onSubmit={handleSave} className="flex flex-col h-full max-h-[90vh]">
                                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                                        {editingReview ? 'Edytuj' : 'Dodaj'} <span className="text-red-600">Opinię</span>
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditorOpen(false)}
                                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-6 overflow-y-auto">
                                    {/* Author Info Group */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Imię i Nazwisko</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.author_name}
                                                onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-red-600 outline-none transition-all"
                                                placeholder="np. Marek Wiśniewski"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Rola / Tytuł</label>
                                            <input
                                                type="text"
                                                value={formData.author_role}
                                                onChange={e => setFormData({ ...formData, author_role: e.target.value })}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-red-600 outline-none transition-all"
                                                placeholder="np. Zawodnik Muay Thai"
                                            />
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Treść Opinii</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-red-600 outline-none transition-all resize-none"
                                            placeholder="Co klient o nas myśli?"
                                        />
                                    </div>

                                    {/* Settings Group */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Ocena (1-5)</label>
                                            <div className="flex gap-4">
                                                {[1, 2, 3, 4, 5].map(nu => (
                                                    <button
                                                        key={nu}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, rating: nu })}
                                                        className={`flex-1 py-4 rounded-xl border font-black transition-all ${formData.rating === nu ? 'bg-red-600 border-red-600 text-white' : 'bg-black/20 border-white/5 text-zinc-500 hover:border-white/20'}`}
                                                    >
                                                        {nu}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Avatar URL (Opcjonalnie)</label>
                                            <input
                                                type="url"
                                                value={formData.avatar_url}
                                                onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-red-600 outline-none transition-all"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-black/20 rounded-[2rem] border border-white/5">
                                        <div>
                                            <div className="text-sm font-bold uppercase tracking-tight text-white">Status widoczności</div>
                                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Czy ma być widoczna na stronie głównej?</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                            className={`relative w-14 h-8 rounded-full transition-colors ${formData.is_active ? 'bg-red-600' : 'bg-zinc-800'}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.is_active ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-white/5 bg-zinc-900/50 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditorOpen(false)}
                                        className="flex-1 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                                    >
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Zapisz Opinię
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminReviews;

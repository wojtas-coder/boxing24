import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseData as supabase } from '../../lib/supabaseClient';
import { Save, Eye, X, Image as ImageIcon, AlertCircle, RefreshCw, GraduationCap } from 'lucide-react';
import RichTextEditor from '../common/RichTextEditor';
import ImageUploader from '../common/ImageUploader';

const KnowledgeEditor = ({ article, onClose, onSave }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Trening',
        image_url: '',
        author_name: 'Redakcja Boxing24',
        difficulty_level: 'Początkujący',
        reading_time_min: 5,
        is_premium: false,
        has_dual_version: false,
        free_content: '',
        premium_content: ''
    });

    const [showPreview, setShowPreview] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [slugError, setSlugError] = useState(null);

    useEffect(() => {
        if (article) {
            const { created_at, updated_at, id, tags, ...rest } = article;
            setFormData(prev => ({
                ...prev,
                ...rest
            }));
        }
    }, [article]);

    useEffect(() => {
        setImageError(false);
    }, [formData.image_url]);

    const mutation = useMutation({
        mutationFn: async (newArticle) => {
            const payload = { ...newArticle };

            const { data, error } = article?.id
                ? await supabase.from('knowledge_articles').update(payload).eq('id', article.id).select()
                : await supabase.from('knowledge_articles').insert([payload]).select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge'] });
            onSave();
            onClose();
        },
        onError: (error) => {
            console.error("Mutation failed:", error);
            if (error.code === '23505') {
                setSlugError('Ten URL (slug) jest już zajęty.');
            } else if (error.message?.includes('policy')) {
                alert(`BŁĄD UPRAWNIEŃ (RLS). Zgłoś to administratorowi (brak uprawnień insert/update do knowledge_articles).`);
            } else {
                alert(`Błąd zapisu: ${error.message}`);
            }
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSlugError(null);
        if (!formData.title || !formData.slug) {
            alert("Tytuł i Slug są wymagane.");
            return;
        }
        mutation.mutate(formData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
        }));
        if (name === 'slug') setSlugError(null);
    };

    const generateSlug = () => {
        if (formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/ł/g, 'l').replace(/ś/g, 's').replace(/ć/g, 'c').replace(/ą/g, 'a').replace(/ę/g, 'e').replace(/ź/g, 'z').replace(/ż/g, 'z').replace(/ń/g, 'n').replace(/ó/g, 'o')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');
            setFormData(prev => ({ ...prev, slug }));
            setSlugError(null);
        }
    };

    const handleTitleBlur = () => {
        if (!formData.slug && !article) generateSlug();
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-700 w-full max-w-5xl max-h-[95vh] overflow-y-auto p-6 relative shadow-2xl rounded-xl custom-scrollbar border-t-4 border-t-boxing-green">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-black mb-6 text-white flex items-center gap-3 uppercase italic">
                    <GraduationCap className="text-boxing-green w-8 h-8" />
                    {article ? 'Edytuj Artykuł Edukacyjny' : 'Nowy Artykuł Edukacyjny'}
                    {mutation.isPending && <span className="text-sm text-yellow-500 font-normal ml-2 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Zapisywanie...</span>}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Top Row: Title & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-4 rounded-lg border border-white/5">
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Tytuł Artykułu <span className="text-red-500">*</span></label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                onBlur={handleTitleBlur}
                                placeholder="Np. Biomechanika Prawego Prostego"
                                className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-boxing-green outline-none transition-colors font-bold text-lg"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider flex justify-between">
                                Slug (URL) <span className="text-red-500">*</span>
                                <button type="button" onClick={generateSlug} className="text-[10px] text-boxing-green hover:text-[#b0f020] underline">Regeneruj</button>
                            </label>
                            <div className="relative">
                                <input
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="biomechanika-prawego-prostego"
                                    className={`w-full bg-black border p-3 text-zinc-300 font-mono text-sm rounded outline-none transition-colors ${slugError ? 'border-red-500' : 'border-zinc-700 focus:border-boxing-green'}`}
                                    required
                                />
                                {slugError && <div className="absolute right-3 top-3 text-red-500"><AlertCircle size={16} /></div>}
                            </div>
                            {slugError && <p className="text-xs text-red-500 mt-1">{slugError}</p>}
                        </div>
                    </div>

                    {/* Meta Data Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Kategoria</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-boxing-green outline-none transition-colors text-sm">
                                <option value="Trening">Trening (Praktyka)</option>
                                <option value="Motoryka">Motoryka i Siła</option>
                                <option value="Psychologia">Psychologia</option>
                                <option value="Technika">Analiza Techniki</option>
                                <option value="Dietetyka">Dietetyka i Suplementacja</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Poziom Trudności</label>
                            <select name="difficulty_level" value={formData.difficulty_level} onChange={handleChange} className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-boxing-green outline-none transition-colors text-sm">
                                <option value="Początkujący">🟢 Początkujący</option>
                                <option value="Średniozaawansowany">🟡 Średniozaawansowany</option>
                                <option value="Ekspert">🔴 Ekspert</option>
                                <option value="Trener">🎓 Do Trenera</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Czas Czytania (min)</label>
                            <input type="number" name="reading_time_min" value={formData.reading_time_min} onChange={handleChange} min="1" className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-boxing-green outline-none transition-colors text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Autor</label>
                            <input name="author_name" value={formData.author_name} onChange={handleChange} className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-boxing-green outline-none transition-colors text-sm" />
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="space-y-2 bg-zinc-800/30 p-4 rounded-lg border border-zinc-800">
                        <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider flex items-center gap-2 mb-2">
                            <ImageIcon size={14} /> Zdjęcie Główne
                        </label>
                        <ImageUploader
                            currentImage={formData.image_url}
                            bucketName="media"
                            freeform={true}
                            onUploadSuccess={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                        <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Zajawka / Abstract (Krótki opis)</label>
                        <textarea
                            name="excerpt" value={formData.excerpt} onChange={handleChange} rows="2"
                            placeholder="Krótkie podsumowanie wiedzy zawartej w artykule..."
                            className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-boxing-green outline-none transition-colors text-sm"
                        />
                    </div>

                    {/* Advanced Access Options */}
                    <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl space-y-4">
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer text-white text-sm select-none">
                                <input type="checkbox" name="is_premium" checked={formData.is_premium} onChange={handleChange} className="w-5 h-5 accent-indigo-600 rounded" />
                                <span className={formData.is_premium ? "text-indigo-400 font-bold uppercase tracking-widest" : "text-zinc-400"}>Wymaga Konta Premium (VIP)</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-white text-sm select-none">
                                <input type="checkbox" name="has_dual_version" checked={formData.has_dual_version} onChange={handleChange} className="w-5 h-5 accent-boxing-green rounded" />
                                <span className={formData.has_dual_version ? "text-boxing-green font-bold uppercase tracking-widest" : "text-zinc-400"}>Dwu-wersyjny (Brief / Pełny Raport)</span>
                            </label>
                        </div>
                    </div>

                    {/* Content Logic Based on Toggle */}
                    {formData.has_dual_version ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                            <div className="space-y-4">
                                <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider text-boxing-green">Wersja FREE (Brief Taktyczny)</label>
                                <RichTextEditor
                                    value={formData.free_content}
                                    onChange={(val) => setFormData(prev => ({ ...prev, free_content: val }))}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider text-indigo-400">Wersja PREMIUM (Pełny Raport)</label>
                                <RichTextEditor
                                    value={formData.premium_content}
                                    onChange={(val) => setFormData(prev => ({ ...prev, premium_content: val }))}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 border-t border-white/5 pt-6">
                            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Główna Treść Artykułu</label>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                            />
                        </div>
                    )}


                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-zinc-800">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-zinc-400 hover:text-white rounded-lg transition-colors text-sm font-bold uppercase tracking-wider border border-transparent hover:border-zinc-700">
                            Anuluj
                        </button>
                        <button type="submit" disabled={mutation.isPending} className="bg-boxing-green hover:bg-[#b0f020] text-black px-8 py-3 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-boxing-green/20 hover:shadow-boxing-green/40 transition-all disabled:opacity-50">
                            {mutation.isPending ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save size={18} />}
                            {mutation.isPending ? 'Zapisywanie' : 'Opublikuj Wiedzę'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default KnowledgeEditor;

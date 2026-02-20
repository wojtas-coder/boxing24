import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { Save, Eye, X, Image as ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';
import ImageUploader from '../common/ImageUploader';

const NewsEditor = ({ article, onClose, onSave }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        lead: '',
        content: '',
        category: 'Boks Zawodowy',
        image_url: '',
        author_name: 'Redakcja',
        is_breaking: false,
        source_link: '',
    });

    const [showPreview, setShowPreview] = useState(false);
    const [slugError, setSlugError] = useState(null);

    useEffect(() => {
        if (article) {
            const { created_at, id, ...rest } = article;
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
            if (payload.published_at) delete payload.published_at;

            // Simple optimisitc slug uniqueness check could go here, but DB constraints are safer.

            const { data, error } = article?.id
                ? await supabase.from('news').update(payload).eq('id', article.id).select()
                : await supabase.from('news').insert([payload]).select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news'] });
            onSave();
            onClose();
            // Optional: nice toast notification here
        },
        onError: (error) => {
            console.error("Mutation failed:", error);
            if (error.code === '23505') { // Unique violation
                setSlugError('Ten URL (slug) jest już zajęty. Zmień tytuł lub edytuj pole URL ręcznie.');
            } else if (error.message?.includes('policy')) {
                alert(`BŁĄD UPRAWNIEŃ (RLS): \nTwoja baza danych blokuje zapis.\nSprawdź uprawnienia w Supabase.`);
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
            [name]: type === 'checkbox' ? checked : value
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
        if (!formData.slug && !article) { // Only auto-generate if empty and creating new
            generateSlug();
        }
    };

    if (showPreview) {
        return (
            <div className="fixed inset-0 bg-black/95 z-[60] overflow-y-auto p-4 flex flex-col items-center animate-in fade-in duration-200">
                <div className="w-full max-w-4xl bg-black border border-zinc-800 rounded-lg p-6 relative">
                    <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-4">Podgląd Artykułu</h2>

                    <div className="prose prose-invert max-w-none">
                        <img
                            src={!imageError ? formData.image_url : "https://via.placeholder.com/800x400?text=Brak+Zdjecia"}
                            alt="Preview"
                            className="w-full h-auto max-h-[500px] object-cover rounded mb-6"
                            onError={() => setImageError(true)}
                        />
                        <div className="flex gap-2 mb-4">
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded uppercase font-bold">{formData.category}</span>
                            <span className="text-zinc-400 text-xs py-1">{new Date().toLocaleDateString()}</span>
                        </div>
                        <h1 className="text-4xl font-black mb-4 uppercase">{formData.title}</h1>
                        <p className="text-xl text-zinc-300 font-serif border-l-4 border-red-600 pl-4 mb-6">{formData.lead}</p>
                        <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-700 w-full max-w-5xl max-h-[95vh] overflow-y-auto p-6 relative shadow-2xl rounded-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    {article ? 'Edytuj News' : 'Nowy News'}
                    {mutation.isPending && <span className="text-sm text-yellow-500 font-normal ml-2 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Zapisywanie...</span>}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Top Row: Title & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Tytuł Artykułu <span className="text-red-500">*</span></label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                onBlur={handleTitleBlur}
                                placeholder="Wpisz chwytliwy tytuł..."
                                className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none transition-colors font-bold text-lg"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider flex justify-between">
                                Slug (URL) <span className="text-red-500">*</span>
                                <button type="button" onClick={generateSlug} className="text-[10px] text-zinc-500 hover:text-white underline">Regeneruj</button>
                            </label>
                            <div className="relative">
                                <input
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="tytul-artykulu-url"
                                    className={`w-full bg-black border p-3 text-zinc-300 font-mono text-sm rounded outline-none transition-colors ${slugError ? 'border-red-500' : 'border-zinc-700 focus:border-red-600'}`}
                                    required
                                />
                                {slugError && (
                                    <div className="absolute right-3 top-3 text-red-500">
                                        <AlertCircle size={16} />
                                    </div>
                                )}
                            </div>
                            {slugError && <p className="text-xs text-red-500 mt-1">{slugError}</p>}
                        </div>
                    </div>

                    {/* Second Row: Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Kategoria</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none transition-colors text-sm"
                            >
                                <option value="Boks Zawodowy">Boks Zawodowy</option>
                                <option value="Boks Olimpijski">Boks Olimpijski</option>
                                <option value="Wrocław">Wrocław</option>
                                <option value="Nauka">Nauka</option>
                                <option value="Psychologia">Psychologia</option>
                                <option value="Historia">Historia</option>
                                <option value="Inne">Inne</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Autor</label>
                            <input
                                name="author_name"
                                value={formData.author_name}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none transition-colors text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Opcje</label>
                            <div className="flex items-center gap-4 p-3 bg-black border border-zinc-700 rounded h-[46px]">
                                <label className="flex items-center gap-2 cursor-pointer text-white text-sm select-none">
                                    <input
                                        type="checkbox"
                                        name="is_breaking"
                                        checked={formData.is_breaking}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-red-600 rounded"
                                    />
                                    <span className={formData.is_breaking ? "text-red-500 font-bold" : "text-zinc-400"}>BREAKING NEWS</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="space-y-4 bg-zinc-800/30 p-4 rounded-lg border border-zinc-800">
                        <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider flex items-center gap-2">
                            <ImageIcon size={14} /> Zdjęcie Główne (Wgraj lub wklej link)
                        </label>

                        <div className="flex gap-4">
                            <input
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="flex-1 bg-black border border-zinc-700 p-2 text-white text-sm rounded focus:border-red-600 outline-none transition-colors font-mono"
                            />
                        </div>

                        <div className="mt-4 border-t border-zinc-700 box-border pt-4">
                            <ImageUploader
                                currentImage={formData.image_url}
                                bucketName="media"
                                freeform={true}
                                onUploadSuccess={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                            />
                        </div>

                    </div>

                    {/* Content Section */}
                    <div className="space-y-2">
                        <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Lead (Wstęp)</label>
                        <textarea
                            name="lead"
                            value={formData.lead}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Krótkie wprowadzenie, które wyświetli się na liście..."
                            className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none transition-colors text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Treść Artykułu (HTML)</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows="12"
                            placeholder="Pełna treść artykułu..."
                            className="w-full bg-black border border-zinc-700 p-3 text-white font-mono text-sm rounded focus:border-red-600 outline-none transition-colors"
                        />
                        <div className="flex gap-2 text-[10px] text-zinc-500 font-mono">
                            <span>&lt;b&gt;bold&lt;/b&gt;</span>
                            <span>&lt;h2&gt;header&lt;/h2&gt;</span>
                            <span>&lt;p&gt;paragraph&lt;/p&gt;</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            className="px-6 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
                        >
                            <Eye size={18} /> Podgląd
                        </button>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-zinc-400 hover:text-white rounded-lg transition-colors text-sm font-bold uppercase tracking-wider"
                            >
                                Anuluj
                            </button>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-900/20 hover:shadow-red-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {mutation.isPending ? <RefreshCw className="animate-spin" /> : <Save size={18} />}
                                {mutation.isPending ? 'Zapisywanie' : 'Opublikuj'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewsEditor;

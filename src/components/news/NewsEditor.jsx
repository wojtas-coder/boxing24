import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { Save, Eye, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import NewsCard from './NewsCard'; // Reuse for preview if suitable, or just custom preview
// import ImageUploader from './ImageUploader';

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
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (article) {
            // Filter out fields not in the form or handle them correctly
            const { created_at, id, ...rest } = article;
            setFormData(prev => ({
                ...prev,
                ...rest
            }));
        }
    }, [article]);

    // Reset image error when URL changes
    useEffect(() => {
        setImageError(false);
    }, [formData.image_url]);

    const mutation = useMutation({
        mutationFn: async (newArticle) => {
            // Clean up payload (remove non-db fields if any)
            const payload = { ...newArticle };
            if (payload.published_at) delete payload.published_at; // Ensure we don't send this if it somehow got in

            console.log("Saving article payload:", payload);

            const { data, error } = article?.id
                ? await supabase.from('news').update(payload).eq('id', article.id).select()
                : await supabase.from('news').insert([payload]).select();

            if (error) {
                console.error("Supabase Error:", error);
                throw new Error(error.message || 'Unknown Supabase error');
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news'] });
            onSave();
            onClose();
            alert('Sukces! Artykuł został zapisany.');
        },
        onError: (error) => {
            console.error("Mutation failed:", error);
            if (error.message.includes('policy')) {
                alert(`BŁĄD UPRAWNIEŃ (RLS): \nTwoja baza danych blokuje zapis. \n\nUpewnij się, że wykonałeś skrypt SQL "supabase_news_fix.sql" w panelu Supabase.`);
            } else {
                alert(`Błąd zapisu: ${error.message}`);
            }
        }

    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Auto-generate slug from title if slug is empty
    const handleTitleBlur = () => {
        if (!formData.slug && formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/ł/g, 'l').replace(/ś/g, 's').replace(/ć/g, 'c').replace(/ą/g, 'a').replace(/ę/g, 'e').replace(/ź/g, 'z').replace(/ż/g, 'z').replace(/ń/g, 'n').replace(/ó/g, 'o')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    if (showPreview) {
        return (
            <div className="fixed inset-0 bg-black/95 z-[60] overflow-y-auto p-4 flex flex-col items-center">
                <div className="w-full max-w-4xl bg-black border border-zinc-800 rounded-lg p-6 relative">
                    <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-4">Podgląd Artykułu</h2>

                    <div className="prose prose-invert max-w-none">
                        <img
                            src={!imageError ? formData.image_url : "https://via.placeholder.com/800x400?text=Brak+Zdjecia+lub+Bledny+Link"}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded mb-6"
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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 w-full max-w-5xl max-h-[95vh] overflow-y-auto p-6 relative shadow-2xl rounded-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    {article ? 'Edytuj News' : 'Nowy News'}
                    {mutation.isPending && <span className="text-sm text-yellow-500 font-normal">(Zapisywanie...)</span>}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-sm">Tytuł</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                onBlur={handleTitleBlur}
                                placeholder="Wpisz tytuł artykułu..."
                                className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none transition-colors"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-sm">Slug (URL)</label>
                            <input
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="tytul-artykulu"
                                className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-sm">Kategoria</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none transition-colors"
                            >
                                <option value="Boks Zawodowy">Boks Zawodowy</option>
                                <option value="Boks Olimpijski">Boks Olimpijski</option>
                                <option value="Wrocław">Wrocław</option>
                                <option value="Nauka">Nauka</option>
                                <option value="Psychologia">Psychologia</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-sm">Zdjęcie (Wgraj lub Wklej URL)</label>
                            <div className="space-y-2">
                                {/* <ImageUploader
                                        currentImage={formData.image_url}
                                        onUploadComplete={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                    /> */}
                                <div className="flex gap-2 items-center">
                                    <span className="text-xs text-zinc-500">lub wklej link:</span>
                                    <input
                                        name="image_url"
                                        value={formData.image_url}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="flex-1 bg-black border border-zinc-700 p-2 text-white text-xs rounded focus:border-red-600 outline-none transition-colors"
                                    />
                                </div>
                                {imageError && <p className="text-xs text-red-500 mt-1">Link jest uszkodzony lub to nie jest bezpośredni plik obrazka.</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-sm">Autor</label>
                            <input
                                name="author_name"
                                value={formData.author_name}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-zinc-400 text-sm">Pozycja Zdjęcia (Focus)</label>
                            <select
                                name="image_position"
                                value={formData.image_position || 'center'}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none transition-colors"
                            >
                                <option value="top">Góra (Twarze)</option>
                                <option value="center">Środek</option>
                                <option value="bottom">Dół</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-zinc-400 text-sm">Lead (Krótki opis na liście)</label>
                        <textarea
                            name="lead"
                            value={formData.lead}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Zajawka artykułu..."
                            className="w-full bg-black border border-zinc-700 p-3 text-white rounded focus:border-red-600 outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-zinc-400 text-sm">Treść (HTML / Markdown)</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows="10"
                            placeholder="Treść artykułu. Możesz używać znaczników HTML <b>, <p>, <h2>..."
                            className="w-full bg-black border border-zinc-700 p-3 text-white font-mono text-sm rounded focus:border-red-600 outline-none transition-colors"
                        />
                        <p className="text-xs text-zinc-500">
                            Wskazówka: Użyj &lt;b&gt;pogrubienia&lt;/b&gt;, &lt;br&gt; nowej linii, lub po prostu pisz tekst.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 p-4 bg-black/30 rounded border border-zinc-800">
                        <label className="flex items-center gap-2 cursor-pointer text-white">
                            <input
                                type="checkbox"
                                name="is_breaking"
                                checked={formData.is_breaking}
                                onChange={handleChange}
                                className="w-5 h-5 accent-red-600 rounded"
                            />
                            <span className="font-bold text-red-500">BREAKING NEWS (Pasek na górze)</span>
                        </label>

                        <div className="flex-1">
                            <input
                                name="source_link"
                                value={formData.source_link || ''}
                                onChange={handleChange}
                                placeholder="Link do źródła (opcjonalnie)"
                                className="w-full bg-transparent border-b border-zinc-700 p-1 text-zinc-400 text-sm focus:border-red-600 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            className="px-6 py-3 border border-zinc-600 hover:border-white text-zinc-300 hover:text-white font-bold rounded transition-colors flex items-center gap-2"
                        >
                            <Eye size={18} /> Podgląd
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 font-bold rounded flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.7)] transition-all"
                        >
                            <Save size={18} />
                            {mutation.isPending ? 'Zapisywanie...' : 'Opublikuj News'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewsEditor;

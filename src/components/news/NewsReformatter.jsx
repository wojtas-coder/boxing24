import React, { useState } from 'react';
import { Wand2, X, AlertCircle, Type } from 'lucide-react';

const NewsReformatter = ({ isOpen, onClose, onFormatted }) => {
    const [rawText, setRawText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFormat = async () => {
        if (!rawText.trim()) return;
        setLoading(true);
        setError(null);

        try {
            // Local formatting logic (No API Key needed)
            const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

            if (lines.length < 2) {
                throw new Error("Wklej przynajmniej tytuł i jedno zdanie treści.");
            }

            // 1. Title = First line
            const title = lines[0];

            // 2. Slug = Generated from Title
            const slug = title
                .toLowerCase()
                .replace(/ł/g, 'l').replace(/ś/g, 's').replace(/ć/g, 'c').replace(/ą/g, 'a').replace(/ę/g, 'e').replace(/ź/g, 'z').replace(/ż/g, 'z').replace(/ń/g, 'n').replace(/ó/g, 'o')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');

            // 3. Lead = Second line
            const lead = lines[1];

            // 4. Content = Rest of the lines wrapped in paragraphs
            const contentLines = lines.slice(2);
            let contentHTML = "";

            if (contentLines.length > 0) {
                contentHTML = contentLines.map(line => `<p>${line}</p>`).join('\n');
            } else {
                // If only title and lead provided, maybe the lead is actually the content too?
                // But let's stick to the structure.
                contentHTML = `<p>${lead}</p>`;
            }

            const formattedArticle = {
                title,
                slug,
                lead,
                content: contentHTML,
                category: 'Boks Zawodowy', // Default
                author_name: 'Redakcja',
                is_breaking: false,
                source_link: ''
            };

            // Simulate a short delay for UX
            setTimeout(() => {
                onFormatted(formattedArticle);
                onClose();
                setRawText('');
                setLoading(false);
            }, 500);

        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 w-full max-w-2xl p-6 relative shadow-2xl rounded-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-4 text-white">
                    <Type size={32} />
                    <h2 className="text-2xl font-bold">Szybkie Formatowanie</h2>
                </div>

                <p className="text-zinc-400 mb-4 text-sm">
                    Wklej surowy tekst. System automatycznie go uporządkuje:
                    <br />
                    <span className="font-bold text-white">1. linia = Tytuł</span>,
                    <span className="font-bold text-white"> 2. linia = Wstęp (Lead)</span>,
                    <span className="font-bold text-white"> Reszta = Treść</span>.
                </p>

                <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Tytuł artykułu...&#10;Kakiś krótki wstęp...&#10;Tutaj treść właściwa (akapity)..."
                    className="w-full h-64 bg-black border border-zinc-700 p-4 text-white rounded-lg focus:border-red-600 outline-none transition-colors font-mono text-sm resize-none mb-4"
                />

                {error && (
                    <div className="bg-red-900/20 border border-red-900 text-red-500 p-3 rounded mb-4 flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-zinc-400 hover:text-white"
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={handleFormat}
                        disabled={loading || !rawText.trim()}
                        className={`bg-white hover:bg-zinc-200 text-black px-6 py-2 font-bold rounded flex items-center gap-2 transition-all
                            ${loading ? 'opacity-70 cursor-wait' : ''}
                        `}
                    >
                        <Wand2 size={18} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Przetwarzanie...' : 'Formatuj Tekst'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsReformatter;

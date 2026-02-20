import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabaseData as supabase } from '../../lib/supabaseClient';
import { Image as ImageIcon, Trash2, Copy, AlertCircle, RefreshCw, Upload, FileImageIcon, X } from 'lucide-react';
import ImageUploader from '../../components/common/ImageUploader';

const AdminMedia = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copySuccess, setCopySuccess] = useState('');
    const [showUploader, setShowUploader] = useState(false);

    const bucketName = 'media';
    const BUCKET_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucketName}/`;

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.storage.from(bucketName).list('', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });

            if (error) {
                // Handle the case where the bucket might not exist or RLS blocks listing
                if (error.message.includes('Bucket not found') || error.message.includes('The resource was not found')) {
                    setError("Bucket 'media' nie istnieje. Uruchom skrypt SQL z poprzedniego etapu.");
                } else {
                    throw error;
                }
                return;
            }

            // Filter out empty placeholder files (sometimes created by tools)
            const validFiles = data?.filter(f => f.name !== '.emptyFolderPlaceholder') || [];

            // Add public URL to each file object
            const filesWithUrls = validFiles.map(file => ({
                ...file,
                publicUrl: `${BUCKET_URL}${file.name}`
            }));

            setFiles(filesWithUrls);
        } catch (err) {
            console.error("Error fetching media:", err);
            setError("Nie udało się załadować galerii. Zobacz konsolę.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileName) => {
        if (!window.confirm(`Czy na pewno chcesz usunąć plik: ${fileName}? Operacja jest nieodwracalna, a artykuły korzystające z tego zdjęcia stracą je.`)) {
            return;
        }

        try {
            const { error } = await supabase.storage.from(bucketName).remove([fileName]);
            if (error) throw error;

            // Remove from local state to avoid refetching everything immediately
            setFiles(files.filter(f => f.name !== fileName));
        } catch (err) {
            console.error("Error deleting file:", err);
            alert("Nie udało się usunąć pliku. Błąd: " + err.message);
        }
    };

    const handleCopyLink = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopySuccess('Skopiowano!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
            alert('Kopiowanie nie powiodło się.');
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto text-white">

            {/* HEADER */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-zinc-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-sm mb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
                        Biblioteka <span className="text-boxing-green">Mediów</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <span className="w-2 h-2 bg-boxing-green rounded-full animate-pulse"></span>
                        Centralne repozytorium plików Supabase Storage
                    </p>
                </div>
                <div className="flex gap-4 w-full xl:w-auto">
                    <button
                        onClick={fetchFiles}
                        className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all flex items-center justify-center border border-white/5 group"
                        title="Odśwież galerię"
                    >
                        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                    <button
                        onClick={() => setShowUploader(!showUploader)}
                        className={`flex-1 xl:flex-none px-6 py-3 font-bold uppercase tracking-widest text-sm rounded-xl transition-all flex items-center justify-center gap-2 border ${showUploader ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-boxing-green text-black border-boxing-green hover:bg-white hover:border-white'}`}
                    >
                        {showUploader ? (
                            <>Zamknij Wgrywarkę <X className="w-4 h-4" /></>
                        ) : (
                            <>Wgraj Nowe Pliki <Upload className="w-4 h-4" /></>
                        )}
                    </button>
                </div>
            </div>

            {/* UPLOADER SECION */}
            {showUploader && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8"
                >
                    <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
                                <FileImageIcon className="w-5 h-5 text-boxing-green" /> Dowolne Kadrowanie Zdjęć (Freeform)
                            </h3>
                            <p className="text-zinc-400 text-xs">Użyj tego narzędzia aby dowolnie dociąć zdjęcie (również w pionie). Możesz swobodnie ciągnąć za rogi. Po wgraniu, plik pojawi się w galerii poniżej.</p>
                        </div>
                        <ImageUploader
                            currentImage={null}
                            freeform={true}
                            onUploadSuccess={(url) => {
                                // Refresh gallery after upload
                                fetchFiles();
                                // Optional: close uploader or show success message, for now let's keep it open
                            }}
                        />
                    </div>
                </motion.div>
            )}

            {/* CONTENT AREA */}
            {error && (
                <div className="p-6 bg-red-900/20 border border-red-500/30 text-red-400 rounded-2xl flex items-center gap-3 mb-8">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4 opacity-50" />
                    <p className="tracking-widest uppercase text-xs font-bold">Ładowanie zasobów z chmury...</p>
                </div>
            ) : files.length === 0 && !error ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-zinc-900/20 rounded-3xl border border-white/5 border-dashed">
                    <FileImageIcon className="w-16 h-16 opacity-20 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Baza Mediów jest pusta</h3>
                    <p className="tracking-widest uppercase text-xs font-bold">Wgraj pierwsze zdjęcia za pomocą panelu powyżej.</p>
                </div>
            ) : (
                <>
                    {/* Floating Toast for copy success */}
                    {copySuccess && (
                        <div className="fixed bottom-8 right-8 bg-boxing-green text-black px-4 py-2 rounded-lg font-bold shadow-2xl z-50 animate-bounce">
                            {copySuccess}
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {files.map((file) => (
                            <div key={file.id} className="group relative bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-boxing-green/50 transition-all aspect-square flex flex-col">

                                {/* Image Preview */}
                                <div className="flex-1 bg-black overflow-hidden relative">
                                    <img
                                        src={file.publicUrl}
                                        alt={file.name}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                        loading="lazy"
                                    />

                                    {/* Action Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                                        <button
                                            onClick={() => handleCopyLink(file.publicUrl)}
                                            className="p-3 bg-zinc-800 hover:bg-boxing-green hover:text-black rounded-full text-white transition-colors"
                                            title="Kopiuj URL"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(file.name)}
                                            className="p-3 bg-red-900/80 hover:bg-red-600 rounded-full text-white transition-colors"
                                            title="Usuń na zawsze"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* File Metadata Info */}
                                <div className="p-3 bg-zinc-900/90 backdrop-blur-md text-xs border-t border-white/5">
                                    <p className="truncate text-white font-bold mb-1" title={file.name}>{file.name}</p>
                                    <div className="flex justify-between items-center text-zinc-500">
                                        <span>{formatBytes(file.metadata?.size)}</span>
                                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminMedia;

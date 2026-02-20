import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import { supabaseData as supabase } from '../../lib/supabaseClient';
import { Upload, Crop, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

// Helper to center the crop initially
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    )
}

const ImageUploader = ({ onUploadSuccess, currentImage, bucketName = 'media', freeform = false }) => {
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef(null);
    const imgRef = useRef(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Gallery Picker State
    const [showGallery, setShowGallery] = useState(false);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [galleryError, setGalleryError] = useState(null);

    const aspect = freeform ? undefined : (16 / 9);

    const fetchGalleryFiles = async () => {
        setGalleryLoading(true);
        setGalleryError(null);
        try {
            const { data, error } = await supabase.storage.from(bucketName).list('', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });

            if (error) throw error;

            const validFiles = data?.filter(f => f.name !== '.emptyFolderPlaceholder') || [];
            const BUCKET_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucketName}/`;

            setGalleryFiles(validFiles.map(file => ({
                ...file,
                publicUrl: `${BUCKET_URL}${file.name}`
            })));
        } catch (err) {
            console.error("Gallery fetch error:", err);
            setGalleryError("Nie udało się załadować galerii.");
        } finally {
            setGalleryLoading(false);
        }
    };

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        if (aspect) {
            setCrop(centerAspectCrop(width, height, aspect));
        } else {
            // Default freeform center crop
            setCrop(centerCrop(
                makeAspectCrop({ unit: '%', width: 90 }, width / height, width, height),
                width,
                height
            ));
        }
    };

    const handleUpload = async () => {
        if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
            return;
        }

        setIsUploading(true);

        try {
            // Draw cropped image to canvas
            const canvas = previewCanvasRef.current;
            const image = imgRef.current;
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            const ctx = canvas.getContext('2d');
            const pixelRatio = window.devicePixelRatio;

            canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
            canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

            ctx.scale(pixelRatio, pixelRatio);
            ctx.imageSmoothingQuality = 'high';

            const cropX = completedCrop.x * scaleX;
            const cropY = completedCrop.y * scaleY;
            const cropWidth = completedCrop.width * scaleX;
            const cropHeight = completedCrop.height * scaleY;

            ctx.drawImage(
                image,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            );

            // Convert canvas to blob
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9));
            if (!blob) throw new Error('Canvas is empty');

            const fileName = `upload_${Date.now()}.webp`;
            const filePath = `articles/${fileName}`;

            // Upload to Supabase
            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(filePath, blob, {
                    contentType: 'image/webp',
                    upsert: false
                });

            if (error) {
                console.error("Upload error details:", error);
                // Fallback attempt: if bucket 'media' doesn't exist, try putting it just as base64 or warn user
                alert("Błąd wgrywania: Upewnij się, że bucket '" + bucketName + "' istnieje w Supabase Storage i ma publiczny dostęp.");
                throw error;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            onUploadSuccess(urlData.publicUrl);
            setImgSrc(''); // Reset after upload

        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full bg-black border border-zinc-700 rounded-lg p-4">

            {/* Hidden canvas for image processing */}
            <canvas ref={previewCanvasRef} style={{ display: 'none' }} />

            {!imgSrc ? (
                <div className="w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 border-dashed transition-colors w-full justify-center">
                            <Upload size={18} />
                            <span className="text-sm font-bold uppercase tracking-wider">Wybierz z dysku</span>
                            <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
                        </label>

                        <button
                            type="button"
                            onClick={() => {
                                setShowGallery(true);
                                fetchGalleryFiles();
                            }}
                            className="flex items-center gap-2 cursor-pointer bg-boxing-green/10 hover:bg-boxing-green/20 text-boxing-green px-4 py-3 rounded-lg border border-boxing-green/50 border-dashed transition-colors w-full justify-center"
                        >
                            <ImageIcon size={18} />
                            <span className="text-sm font-bold uppercase tracking-wider">Wybierz z Galerii</span>
                        </button>
                    </div>

                    {/* Gallery Modal */}
                    {showGallery && (
                        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
                            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50">
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
                                        <ImageIcon className="text-boxing-green w-6 h-6" /> Biblioteka Mediów
                                    </h3>
                                    <button onClick={() => setShowGallery(false)} className="p-2 bg-zinc-800 hover:bg-red-500 hover:text-white rounded-full transition-colors text-zinc-400">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6">
                                    {galleryLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                                            <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-50" />
                                            <p className="font-bold uppercase tracking-wider text-xs text-center">Wczytywanie Galerii...</p>
                                        </div>
                                    ) : galleryError ? (
                                        <div className="bg-red-900/20 text-red-500 p-4 rounded-xl text-center border border-red-500/30">
                                            {galleryError}
                                        </div>
                                    ) : galleryFiles.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                                            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-bold uppercase tracking-wider text-xs">Galeria jest pusta.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {galleryFiles.map(file => (
                                                <button
                                                    key={file.id}
                                                    onClick={() => {
                                                        onUploadSuccess(file.publicUrl);
                                                        setShowGallery(false);
                                                    }}
                                                    className="group relative aspect-square bg-black border border-white/10 rounded-xl overflow-hidden hover:border-boxing-green transition-all"
                                                >
                                                    <img src={file.publicUrl} alt={file.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" loading="lazy" />
                                                    <div className="absolute inset-0 bg-boxing-green/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="bg-boxing-green text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded shadow-xl">Wybierz</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentImage && (
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                            <span className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Obecne zdjęcie:</span>
                            <div className="h-32 rounded border border-zinc-700 overflow-hidden relative group">
                                <img src={currentImage} className="w-full h-full object-cover" alt="Current" />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-boxing-green font-bold uppercase tracking-wider">Przytnij Zdjęcie (Format 16:9)</span>
                        <button onClick={() => setImgSrc('')} className="text-zinc-500 hover:text-white p-1">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded flex justify-center overflow-hidden max-h-[400px]">
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                            className="max-h-[400px]"
                        >
                            <img
                                ref={imgRef}
                                alt="Ujęcie cięcia"
                                src={imgSrc}
                                onLoad={onImageLoad}
                                className="max-h-[400px] object-contain"
                            />
                        </ReactCrop>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setImgSrc('')}
                            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            Anuluj Wybór
                        </button>
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={isUploading || !completedCrop}
                            className={`flex items-center gap-2 px-6 py-2 rounded font-bold uppercase tracking-wider text-sm ${isUploading ? 'bg-zinc-700 text-zinc-400' : 'bg-boxing-green text-black hover:bg-[#b0f020]'} transition-all`}
                        >
                            {isUploading ? (
                                <><Loader2 size={16} className="animate-spin" /> Wgrywanie...</>
                            ) : (
                                <><Check size={16} /> Zatwierdź i Wyślij</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;

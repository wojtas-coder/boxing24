import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { supabase } from '../../lib/supabaseClient';
import getCroppedImg from '../../utils/imageUtils';
import { X, Upload, Check, RotateCw, ZoomIn } from 'lucide-react';

const ImageUploader = ({ onUploadComplete, currentImage }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isCropOpen, setIsCropOpen] = useState(false);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const onFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            let imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setIsCropOpen(true);
        }
    };

    const readFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result), false);
            reader.readAsDataURL(file);
        });
    };

    const handleUpload = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setUploading(true);

        try {
            const croppedImageBlob = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation
            );

            const fileName = `news-${Date.now()}.jpg`;
            const { data, error } = await supabase.storage
                .from('news-images')
                .upload(fileName, croppedImageBlob, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('news-images')
                .getPublicUrl(fileName);

            onUploadComplete(publicUrl);
            setIsCropOpen(false);
            setImageSrc(null); // Reset
        } catch (e) {
            console.error('Upload Error:', e);
            alert('Błąd podczas wysyłania zdjęcia: ' + e.message);
        } finally {
            setUploading(false);
        }
    };

    if (isCropOpen) {
        return (
            <div className="fixed inset-0 z-[70] bg-black/95 flex flex-col">
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
                    <h3 className="text-white font-bold">Dostosuj Zdjęcie (16:9)</h3>
                    <button onClick={() => setIsCropOpen(false)} className="text-white hover:text-red-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="relative flex-1 bg-zinc-900 w-full">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={16 / 9}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                    />
                </div>

                <div className="bg-zinc-900 p-6 space-y-4 border-t border-zinc-800">
                    <div className="flex items-center gap-4">
                        <ZoomIn className="text-zinc-400 w-5 h-5" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <RotateCw className="text-zinc-400 w-5 h-5" />
                        <input
                            type="range"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            aria-labelledby="Rotation"
                            onChange={(e) => setRotation(e.target.value)}
                            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            onClick={() => setIsCropOpen(false)}
                            className="px-6 py-2 text-zinc-400 hover:text-white"
                        >
                            Anuluj
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="bg-red-600 hover:bg-red-500 text-white px-8 py-2 rounded font-bold flex items-center gap-2"
                        >
                            {uploading ? 'Wysyłanie...' : <><Check size={18} /> Zatwierdź</>}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative group">
            <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
                id="news-image-upload"
            />

            {currentImage ? (
                <div className="relative rounded overflow-hidden border border-zinc-700 group-hover:border-zinc-500 transition-colors">
                    <img src={currentImage} alt="Current" className="w-full h-32 object-cover" />
                    <label
                        htmlFor="news-image-upload"
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold gap-2"
                    >
                        <RotateCw size={18} /> Zmień
                    </label>
                </div>
            ) : (
                <label
                    htmlFor="news-image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded hover:border-red-600 hover:bg-zinc-900 transition-all cursor-pointer text-zinc-500 hover:text-red-500"
                >
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm font-bold">Wgraj Zdjęcie</span>
                    <span className="text-xs opacity-70">JPG, PNG (Max 5MB)</span>
                </label>
            )}
        </div>
    );
};

export default ImageUploader;

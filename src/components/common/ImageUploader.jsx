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

const ImageUploader = ({ onUploadSuccess, currentImage, bucketName = 'media' }) => {
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef(null);
    const imgRef = useRef(null);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const aspect = 16 / 9; // Default aspect ratio for cover images

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onImageLoad = (e) => {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
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
                    <label className="flex items-center gap-2 cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg border border-zinc-600 border-dashed transition-colors w-full justify-center">
                        <Upload size={18} />
                        <span className="text-sm font-bold uppercase tracking-wider">Wybierz zdjęcie z dysku</span>
                        <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
                    </label>

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

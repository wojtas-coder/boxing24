import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
    Plus, Search, Edit2, Trash2, Eye, EyeOff, Loader2, Save, X, Image as ImageIcon,
    AlertCircle, Tag, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const emptyProduct = {
    slug: '',
    brand: '',
    name: '',
    price: '',
    old_price: '',
    category: 'Rękawice',
    stock_count: 10,
    sizes: [],
    is_preorder: false,
    image_url: '',
    badge: '',
    short_desc: '',
    verdict: '',
    deep_dive: '',
    stress_test: '',
    specs: [],
    is_active: true
};

const AdminBoutique = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(emptyProduct);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Nie udało się pobrać produktów.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (event) => {
        try {
            setUploadingImage(true);
            setError(null);
            const file = event.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            setCurrentProduct(prev => ({ ...prev, image_url: publicUrl }));
        } catch (err) {
            console.error('Upload error:', err);
            setError('Błąd podczas wgrywania zdjęcia.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async () => {
        try {
            setError(null);
            if (!currentProduct.name || !currentProduct.slug || !currentProduct.price) {
                setError('Wypełnij wymagane pola (Nazwa, Slug, Cena).');
                return;
            }

            const payload = { ...currentProduct };
            delete payload.id; // Usuwamy ID jeśli było
            delete payload.created_at;
            delete payload.updated_at;

            if (currentProduct.id) {
                // Update
                const { error: updateError } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', currentProduct.id);
                if (updateError) throw updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([payload]);
                if (insertError) throw insertError;
            }

            setSuccess('Zapisano produkt pomyślnie!');
            setIsEditing(false);
            setCurrentProduct(emptyProduct);
            fetchProducts();

            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Save error:', err);
            setError(`Błąd podczas zapisywania produktu: ${err.message || JSON.stringify(err)}`);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            fetchProducts();
        } catch (err) {
            console.error('Toggle error:', err);
            setError(`Nie udało się zmienić statusu: ${err.message || JSON.stringify(err)}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten produkt? Operacji nie można cofnąć.')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchProducts();
            setSuccess('Produkt usunięty.');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Delete error:', err);
            setError(`Nie udało się usunąć produktu: ${err.message || JSON.stringify(err)}`);
        }
    };

    const handleAddSpec = () => {
        setCurrentProduct(prev => ({
            ...prev,
            specs: [...prev.specs, { label: '', value: '' }]
        }));
    };

    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...currentProduct.specs];
        newSpecs[index][field] = value;
        setCurrentProduct(prev => ({ ...prev, specs: newSpecs }));
    };

    const handleRemoveSpec = (index) => {
        const newSpecs = currentProduct.specs.filter((_, i) => i !== index);
        setCurrentProduct(prev => ({ ...prev, specs: newSpecs }));
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900 p-6 rounded-xl border border-white/10">
                <div>
                    <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                        Sklep & Boutique
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Zarządzaj asortymentem, cenami i widocznością</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentProduct(emptyProduct);
                        setIsEditing(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-boxing-green text-black font-bold uppercase tracking-widest text-sm rounded hover:bg-green-500 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Dodaj Produkt
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5" /> {error}</div>
                    <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
                </div>
            )}

            {success && (
                <div className="bg-boxing-green/10 border border-boxing-green/50 text-boxing-green px-4 py-3 rounded-xl flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> {success}
                </div>
            )}

            {!isEditing ? (
                /* WIDOK LISTY */
                <div className="bg-zinc-900 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Szukaj produktu..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-boxing-green transition-colors"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/50 text-xs uppercase tracking-widest text-gray-400">
                                <tr>
                                    <th className="p-4 font-medium">Produkt</th>
                                    <th className="p-4 font-medium">Cena</th>
                                    <th className="p-4 font-medium">Badge</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-boxing-green mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500">
                                            Brak produktów. Dodaj nowy asortyment.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className={`hover:bg-white/5 transition-colors ${!product.is_active ? 'opacity-50' : ''}`}>
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-black rounded border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Tag className="w-5 h-5 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-boxing-green font-bold tracking-widest uppercase mb-1">{product.brand} • {product.category || 'Produkt'}</div>
                                                        <div className="font-medium text-white">{product.name} {product.is_preorder && <span className="ml-2 text-[10px] bg-red-600 px-1 py-0.5 rounded text-white uppercase">Pre</span>}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-gray-300 font-bold">{product.price}</div>
                                                {product.old_price && <div className="text-xs text-gray-500 line-through">{product.old_price}</div>}
                                            </td>
                                            <td className="p-4">
                                                {product.badge ? (
                                                    <span className="bg-white/10 text-white text-xs px-2 py-1 uppercase tracking-wider rounded">
                                                        {product.badge}
                                                    </span>
                                                ) : <span className="text-gray-600">-</span>}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleToggleActive(product.id, product.is_active)}
                                                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest transition-colors ${product.is_active
                                                        ? 'bg-boxing-green/20 text-boxing-green hover:bg-boxing-green/30'
                                                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                        }`}
                                                >
                                                    {product.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                    {product.is_active ? 'Widoczny' : 'Ukryty'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setCurrentProduct(product);
                                                            setIsEditing(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-white bg-black rounded transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 bg-black rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* WIDOK EDYCJI FORMULARZA */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 rounded-xl border border-white/10 p-6"
                >
                    <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                        <h2 className="text-xl font-bold text-white uppercase tracking-widest">
                            {currentProduct.id ? 'Edytuj Produkt' : 'Nowy Produkt'}
                        </h2>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-2 text-gray-400 hover:text-white bg-black rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Kolumna boczna - Zdjęcie */}
                        <div className="lg:col-span-1 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Zdjęcie / Złota Okładka</label>
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center aspect-square flex flex-col items-center justify-center relative overflow-hidden bg-black/50 hover:border-boxing-green/50 transition-colors">
                                    {currentProduct.image_url ? (
                                        <>
                                            <img src={currentProduct.image_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                            <div className="relative z-10 bg-black/80 px-4 py-2 rounded text-xs text-white uppercase tracking-widest border border-white/20 backdrop-blur-sm">
                                                Zmień zdjęcie
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-8 h-8 text-gray-600 mb-2" />
                                            <span className="text-gray-500 text-sm">Kliknij, aby wgrać zdjęcie z dysku</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        disabled={uploadingImage}
                                    />
                                    {uploadingImage && (
                                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
                                            <Loader2 className="w-8 h-8 animate-spin text-boxing-green" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Cena</label>
                                        <input
                                            type="text"
                                            value={currentProduct.price}
                                            onChange={e => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded p-3 text-white focus:outline-none focus:border-boxing-green transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Stara Cena</label>
                                        <input
                                            type="text"
                                            value={currentProduct.old_price || ''}
                                            onChange={e => setCurrentProduct({ ...currentProduct, old_price: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded p-3 text-gray-400 focus:outline-none focus:border-boxing-green transition-colors placeholder:text-gray-700"
                                            placeholder="Przekreślona"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Badge (np. NEW DROP)</label>
                                    <input
                                        type="text"
                                        value={currentProduct.badge || ''}
                                        onChange={e => setCurrentProduct({ ...currentProduct, badge: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-white focus:outline-none focus:border-boxing-green transition-colors placeholder:text-gray-700"
                                        placeholder="Opcjonalna naklejka"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Kategoria</label>
                                        <select
                                            value={currentProduct.category || 'Sprzęt'}
                                            onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded p-3 text-white focus:outline-none focus:border-boxing-green transition-colors"
                                        >
                                            <option value="Rękawice">Rękawice</option>
                                            <option value="Tarcze i Worki">Tarcze i Worki</option>
                                            <option value="Odzież">Odzież</option>
                                            <option value="Akcesoria">Akcesoria</option>
                                            <option value="Sprzęt">Sprzęt Inny</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Seria / Brand</label>
                                        <input
                                            type="text"
                                            value={currentProduct.brand}
                                            onChange={e => setCurrentProduct({ ...currentProduct, brand: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded p-3 text-white focus:outline-none focus:border-boxing-green transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Magazyn (Ilość)</label>
                                        <input
                                            type="number"
                                            value={currentProduct.stock_count || 0}
                                            onChange={e => setCurrentProduct({ ...currentProduct, stock_count: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-black border border-white/10 rounded p-3 text-white focus:outline-none focus:border-boxing-green transition-colors"
                                        />
                                    </div>
                                    <div className="flex items-center pt-8">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={currentProduct.is_preorder || false}
                                                onChange={e => setCurrentProduct({ ...currentProduct, is_preorder: e.target.checked })}
                                                className="w-5 h-5 rounded bg-black border border-white/10 text-boxing-green focus:ring-0 focus:ring-offset-0"
                                            />
                                            <span className="text-sm font-bold text-white uppercase tracking-widest group-hover:text-boxing-green transition-colors">Pre-order?</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Rozmiary (po przecinku)</label>
                                    <input
                                        type="text"
                                        value={currentProduct.sizes?.join(', ') || ''}
                                        onChange={e => setCurrentProduct({ ...currentProduct, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-white focus:outline-none focus:border-boxing-green transition-colors placeholder:text-gray-700"
                                        placeholder="np. 10oz, 12oz, 14oz LUB S, M, L"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Główna kolumna - Teksty */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nazwa Produktu</label>
                                    <input
                                        type="text"
                                        value={currentProduct.name}
                                        onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-white font-bold focus:outline-none focus:border-boxing-green transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Krótki Slug (do linku np. super-rekawice)</label>
                                    <input
                                        type="text"
                                        value={currentProduct.slug}
                                        onChange={e => setCurrentProduct({ ...currentProduct, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-gray-400 focus:outline-none focus:border-boxing-green transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Krótki Opis (Zajawka w sklepie)</label>
                                <textarea
                                    rows="2"
                                    value={currentProduct.short_desc}
                                    onChange={e => setCurrentProduct({ ...currentProduct, short_desc: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:outline-none focus:border-boxing-green transition-colors resize-y"
                                ></textarea>
                            </div>

                            <div className="bg-white/5 border border-boxing-green/30 rounded-lg p-4">
                                <label className="block text-xs font-bold text-boxing-green uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Werdykt Eksperta</label>
                                <textarea
                                    rows="2"
                                    value={currentProduct.verdict}
                                    onChange={e => setCurrentProduct({ ...currentProduct, verdict: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white italic focus:outline-none focus:border-boxing-green transition-colors"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2"><Zap className="inline w-3 h-3 text-boxing-green mr-1" /> Technical Deep Dive</label>
                                    <textarea
                                        rows="4"
                                        value={currentProduct.deep_dive}
                                        onChange={e => setCurrentProduct({ ...currentProduct, deep_dive: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-gray-300 text-sm focus:outline-none focus:border-boxing-green transition-colors resize-y"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2"><Activity className="inline w-3 h-3 text-boxing-green mr-1" /> Stress Test</label>
                                    <textarea
                                        rows="4"
                                        value={currentProduct.stress_test}
                                        onChange={e => setCurrentProduct({ ...currentProduct, stress_test: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-gray-300 text-sm focus:outline-none focus:border-boxing-green transition-colors resize-y"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Tabela Specyfikacji */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Tabela Specyfikacji (Specs)</label>
                                    <button
                                        onClick={handleAddSpec}
                                        className="text-xs flex items-center gap-1 text-boxing-green hover:text-green-400 py-1"
                                    >
                                        <Plus className="w-3 h-3" /> Dodaj wiersz
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {currentProduct.specs?.map((spec, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                placeholder="Label (np. Materiał)"
                                                value={spec.label}
                                                onChange={e => handleSpecChange(index, 'label', e.target.value)}
                                                className="w-1/3 bg-black border border-white/10 rounded p-2 text-sm text-gray-400 focus:outline-none focus:border-boxing-green"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Wartość (np. Skóra 100%)"
                                                value={spec.value}
                                                onChange={e => handleSpecChange(index, 'value', e.target.value)}
                                                className="flex-1 bg-black border border-white/10 rounded p-2 text-sm text-white focus:outline-none focus:border-boxing-green"
                                            />
                                            <button
                                                onClick={() => handleRemoveSpec(index)}
                                                className="p-2 text-gray-500 hover:text-red-500 transition-colors bg-black rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {(currentProduct.specs?.length === 0 || !currentProduct.specs) && (
                                        <div className="text-sm text-gray-600 italic">Brak specyfikacji technicznej.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-4">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-3 font-bold uppercase tracking-widest text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Anuluj
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={uploadingImage}
                            className={`flex items-center gap-2 px-8 py-3 bg-boxing-green text-black font-black uppercase tracking-widest text-sm rounded transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500'}`}
                        >
                            <Save className="w-4 h-4" />
                            {currentProduct.id ? 'Zapisz Zmiany' : 'Utwórz Produkt'}
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AdminBoutique;

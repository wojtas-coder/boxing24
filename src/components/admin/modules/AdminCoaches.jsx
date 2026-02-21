import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
    Users, Plus, Trash2, Edit2, Save, X, Image as ImageIcon,
    AlertTriangle, RefreshCw, Check
} from 'lucide-react';
import ImageUploader from '../../common/ImageUploader';

const AdminCoaches = () => {
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentCoach, setCurrentCoach] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        title: '',
        image_url: '',
        description: '',
        specialties: [],
        price: '',
        cal_link: '',
        order_index: 0,
        is_active: true
    });
    const [tempSpecialty, setTempSpecialty] = useState('');

    useEffect(() => {
        fetchCoaches();
    }, []);

    const fetchCoaches = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('coaches')
                .select('*')
                .order('order_index', { ascending: true })
                .order('created_at', { ascending: true });

            if (error) throw error;
            setCoaches(data || []);
        } catch (err) {
            console.error("Błąd pobierania trenerów:", err);
            setError("Nie udało się pobrać listy trenerów. Upewnij się, że tabela w bazie danych została utworzona skryptem SQL.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditor = (coach = null) => {
        if (coach) {
            setCurrentCoach(coach);
            setFormData({
                name: coach.name || '',
                location: coach.location || '',
                title: coach.title || '',
                image_url: coach.image_url || '',
                description: coach.description || '',
                specialties: coach.specialties || [],
                price: coach.price || '',
                cal_link: coach.cal_link || '',
                order_index: coach.order_index || 0,
                is_active: coach.is_active ?? true
            });
        } else {
            setCurrentCoach(null);
            setFormData({
                name: '',
                location: '',
                title: '',
                image_url: '',
                description: '',
                specialties: [],
                price: '',
                cal_link: '',
                order_index: coaches.length + 1,
                is_active: true
            });
        }
        setIsEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setCurrentCoach(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddSpecialty = () => {
        if (tempSpecialty.trim()) {
            setFormData(prev => ({
                ...prev,
                specialties: [...prev.specialties, tempSpecialty.trim()]
            }));
            setTempSpecialty('');
        }
    };

    const handleRemoveSpecialty = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.filter((_, i) => i !== indexToRemove)
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (currentCoach) {
                // Update
                const { error } = await supabase
                    .from('coaches')
                    .update({
                        ...formData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentCoach.id);
                if (error) throw error;
                setSuccess("Profil trenera zaktualizowany pomyślnie.");
            } else {
                // Insert
                const { error } = await supabase
                    .from('coaches')
                    .insert([formData]);
                if (error) throw error;
                setSuccess("Dodano nowego trenera.");
            }

            fetchCoaches();
            handleCloseEditor();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Błąd zapisu trenera:", err);
            setError(`Błąd podczas zapisywania: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Na pewno usunąć tego trenera z bazy? To usunie go ze strony rezerwacji na zawsze.")) return;

        try {
            const { error } = await supabase
                .from('coaches')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSuccess("Trener został usunięty.");
            fetchCoaches();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Błąd usuwania:", err);
            alert(`Nie udało się usunąć: ${err.message}`);
        }
    };

    if (loading && coaches.length === 0) return <div className="text-zinc-500 animate-pulse p-8">Ładowanie kadry trenerskiej...</div>;

    return (
        <div className="space-y-8 max-w-6xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Users className="text-red-600 w-8 h-8" /> Zespół <span className="text-red-600">Trenerów</span>
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">Zarządzanie kadrą na stronie rezerwacji i coachingu</p>
                </div>
                <button
                    onClick={() => handleOpenEditor()}
                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 font-bold flex items-center gap-2 rounded-xl transition-all uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                >
                    <Plus className="w-5 h-5" /> Dodaj Trenera
                </button>
            </div>

            {error && !isEditorOpen && (
                <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
            )}

            {success && !isEditorOpen && (
                <div className="p-4 bg-green-900/20 border border-green-500/20 text-green-500 rounded-xl flex items-center gap-3 font-bold text-sm shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                    <Check className="w-5 h-5 flex-shrink-0" /> {success}
                </div>
            )}

            {/* Coaches List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {coaches.map(coach => (
                    <div key={coach.id} className={`bg-zinc-900/40 border ${coach.is_active ? 'border-white/10 hover:border-red-500/30' : 'border-zinc-800 opacity-50'} rounded-2xl p-6 transition-all flex flex-col md:flex-row gap-6 relative overflow-hidden group`}>
                        {/* Red Corner */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full -mr-12 -mt-12 pointer-events-none transition-transform group-hover:scale-150"></div>

                        {/* Image */}
                        <div className="w-full md:w-32 h-40 bg-black rounded-xl overflow-hidden shadow-lg border border-white/5 flex-shrink-0">
                            {coach.image_url ? (
                                <img src={coach.image_url} alt={coach.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-800"><Users size={32} /></div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">{coach.name}</h3>
                                    {!coach.is_active && <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded uppercase tracking-wider">Nieaktywny</span>}
                                </div>
                                <p className="text-red-500 font-bold uppercase tracking-widest text-[10px] mb-3">{coach.title}</p>
                                <p className="text-zinc-400 text-sm line-clamp-3 leading-relaxed mb-4">{coach.description}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-auto">
                                <button
                                    onClick={() => handleOpenEditor(coach)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors border border-white/5"
                                >
                                    <Edit2 className="w-4 h-4" /> Edytuj
                                </button>
                                <button
                                    onClick={() => handleDelete(coach.id)}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20 hover:border-red-500/40"
                                    title="Usuń na zawsze"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <span className="ml-auto text-xs font-mono text-zinc-500">ID: {coach.cal_link || 'Brak Cal.com'}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {coaches.length === 0 && !loading && !error && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
                        <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-widest">Brak trenerów w bazie</h3>
                        <p className="text-zinc-600 text-sm mt-2">Dodaj pierwszego trenera uruchamiając skrypt SQL lub przyciskiem powyżej.</p>
                    </div>
                )}
            </div>

            {/* EDITOR MODAL */}
            {isEditorOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative">

                        {/* Modal Header */}
                        <div className="sticky top-0 bg-zinc-900/90 backdrop-blur z-10 border-b border-white/5 p-6 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                                <Users className="text-red-600 w-5 h-5" />
                                {currentCoach ? `Edytuj: ${currentCoach.name}` : 'Nowy Trener'}
                            </h2>
                            <button onClick={handleCloseEditor} className="p-2 text-zinc-500 hover:text-white bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-8">

                            {/* General Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Imię i Nazwisko</label>
                                    <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors" placeholder="Napisz..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Identyfikator Cal.com (Slug)</label>
                                    <input name="cal_link" value={formData.cal_link} onChange={handleChange} className="w-full bg-black border border-white/10 rounded p-3 text-white font-mono text-sm focus:border-red-500 outline-none transition-colors" placeholder="np. wojciech" />
                                    <p className="text-[10px] text-zinc-600">ID z systemu rezerwacji Cal.com używane na stronie Bookingu.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Lokalizacja</label>
                                    <input name="location" value={formData.location} onChange={handleChange} className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors" placeholder="Wrocław / Cała Polska" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Stanowisko / Tytuł</label>
                                    <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors" placeholder="np. Główny Trener" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Cena za trening</label>
                                    <input name="price" value={formData.price} onChange={handleChange} className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors" placeholder="np. 200 PLN" />
                                </div>
                                <div className="space-y-2 flex items-center gap-4 mt-6">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                        <span className={`ml-3 text-sm font-bold uppercase tracking-wider ${formData.is_active ? 'text-white' : 'text-zinc-500'}`}>Aktywny Profil</span>
                                    </label>
                                </div>
                            </div>

                            {/* Main Text Content */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Opis (Biografia / Doświadczenie)</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="5" className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors resize-none leading-relaxed" placeholder="Opowiedz o doświadczeniu trenera..." />
                            </div>

                            {/* Visuals */}
                            <div className="bg-black/50 border border-white/5 rounded-xl p-6 space-y-6">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Zdjęcie Profilowe
                                </label>

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-48 h-64 bg-zinc-900 border border-white/10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                        {formData.image_url ? (
                                            <img src={formData.image_url} alt="Profile preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-10 h-10 text-zinc-700" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <input name="image_url" value={formData.image_url} onChange={handleChange} className="w-full bg-black border border-white/10 rounded p-3 text-white font-mono text-sm focus:border-red-500 outline-none transition-colors" placeholder="Wklej adres z innej strony..." />
                                        <div className="text-center text-zinc-500 text-xs font-bold uppercase tracking-widest my-2">- LUB -</div>
                                        <ImageUploader
                                            currentImage={formData.image_url}
                                            bucketName="media"
                                            freeform={true}
                                            onUploadSuccess={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                        />
                                        <p className="text-[10px] text-zinc-600 mt-2">Dla najlepszej jakości użyj pionowego zdjęcia bez tła (portretowego).</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tags/Specialties */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Specjalizacje / Tagi</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tempSpecialty}
                                        onChange={(e) => setTempSpecialty(e.target.value)}
                                        onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSpecialty(); } }}
                                        className="flex-1 bg-black border border-white/10 rounded p-3 text-white text-sm focus:border-red-500 outline-none transition-colors uppercase tracking-wider font-bold"
                                        placeholder="np. Boks Olimpijski"
                                    />
                                    <button type="button" onClick={handleAddSpecialty} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 rounded font-bold uppercase tracking-wider text-xs transition-colors">Dodaj Tag</button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {formData.specialties.map((spec, index) => (
                                        <div key={index} className="bg-red-600/10 border border-red-500/30 text-red-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            {spec}
                                            <button type="button" onClick={() => handleRemoveSpecialty(index)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-zinc-900/95 backdrop-blur z-10 p-6 border-t border-white/5 flex justify-end gap-4">
                            <button onClick={handleCloseEditor} className="px-6 py-3 bg-transparent text-zinc-400 hover:text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-colors hidden md:block">
                                Anuluj
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 rounded-xl transition-all disabled:opacity-50"
                            >
                                {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Zapisz Profil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoaches;

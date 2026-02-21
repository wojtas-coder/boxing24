import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Loader2, Save, X, Calendar as CalendarIcon, MapPin, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const emptyEvent = {
    date: '',
    title: '',
    location: '',
    description: '',
    type: 'AMATEUR',
    link: '',
    is_active: true
};

const AdminCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(emptyEvent);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('calendar_events')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error('Error fetching calendar events:', err);
            setError('Nie udało się pobrać kalendarza. Sprawdź bazę danych.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            if (!currentEvent.title || !currentEvent.date || !currentEvent.location) {
                setError('Wypełnij wymagane pola (Tytuł, Data, Lokalizacja).');
                setSaving(false);
                return;
            }

            const payload = { ...currentEvent };
            delete payload.id;
            delete payload.created_at;
            delete payload.updated_at;

            if (currentEvent.id) {
                // Update
                const { error: updateError, data } = await supabase
                    .from('calendar_events')
                    .update(payload)
                    .eq('id', currentEvent.id)
                    .select();

                if (updateError) throw updateError;
                if (!data || data.length === 0) {
                    setError('Błąd RLS: Zapis zablokowany. Odśwież sesję.');
                    setSaving(false);
                    return;
                }
            } else {
                // Insert
                const { error: insertError, data } = await supabase
                    .from('calendar_events')
                    .insert([payload])
                    .select();

                if (insertError) throw insertError;
                if (!data || data.length === 0) {
                    setError('Błąd RLS: Dodanie zablokowane.');
                    setSaving(false);
                    return;
                }
            }

            setSuccess('Zapisano wydarzenie!');
            setIsEditing(false);
            setCurrentEvent(emptyEvent);
            fetchEvents();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Save error:', err);
            setError(`Błąd: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const { error, data } = await supabase
                .from('calendar_events')
                .update({ is_active: !currentStatus })
                .eq('id', id)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) {
                setError('Błąd RLS: Zmiana statusu zablokowana.');
                return;
            }
            fetchEvents();
        } catch (err) {
            console.error('Toggle error:', err);
            setError(`Błąd: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Czy na pewno chcesz bezpowrotnie usunąć to wydarzenie? Zamiast tego możesz po prostu ustawić je jako Ukryte.')) return;

        try {
            const { error } = await supabase
                .from('calendar_events')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchEvents();
        } catch (err) {
            console.error('Delete error:', err);
            setError(`Usunięcie się nie powiodło: ${err.message}`);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentEvent(emptyEvent);
        setError(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-black/40 border border-white/5 p-6 rounded-xl flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
                        <CalendarIcon className="w-6 h-6 text-boxing-green" />
                        Kalendarz Wydarzeń
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Zarządzaj obozami, galami i ligami na stronie głównej</p>
                </div>
                <button
                    onClick={() => { setCurrentEvent(emptyEvent); setIsEditing(true); }}
                    className="flex items-center gap-2 bg-boxing-green text-black px-6 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors uppercase tracking-widest text-sm"
                >
                    <Plus className="w-4 h-4" /> Dodaj Wpis
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-xl flex items-center gap-3">
                    <Tag className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm border-boxing-green">{success}</p>
                </div>
            )}

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {isEditing ? (
                    // ====== EDIT MODE ======
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#111] border border-white/5 rounded-xl p-6"
                    >
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white uppercase tracking-widest">
                                {currentEvent.id ? 'Edytuj Wydarzenie' : 'Nowe Wydarzenie'}
                            </h3>
                            <button onClick={handleCancelEdit} className="text-gray-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Zawody / Tytuł *</label>
                                    <input
                                        type="text"
                                        value={currentEvent.title}
                                        onChange={e => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-white focus:outline-none focus:border-boxing-green transition-colors"
                                        placeholder="np. Rocky's Peak / Gala bokserska"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Data *</label>
                                        <input
                                            type="date"
                                            value={currentEvent.date}
                                            onChange={e => setCurrentEvent({ ...currentEvent, date: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded p-3 text-white focus:outline-none focus:border-boxing-green transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Typ *</label>
                                        <select
                                            value={currentEvent.type || 'AMATEUR'}
                                            onChange={e => setCurrentEvent({ ...currentEvent, type: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded p-3 text-white focus:outline-none focus:border-boxing-green transition-colors"
                                        >
                                            <option value="AMATEUR">Amatorzy</option>
                                            <option value="PRO">PRO</option>
                                            <option value="SPECIAL">Obozy / Wydarzenia</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2"><MapPin className="w-3 h-3" /> Lokalizacja *</label>
                                    <input
                                        type="text"
                                        value={currentEvent.location}
                                        onChange={e => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-white focus:outline-none focus:border-boxing-green transition-colors"
                                        placeholder="np. Karpacz / Wrocław"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Krótki Opis / Meta</label>
                                    <textarea
                                        rows="3"
                                        value={currentEvent.description || ''}
                                        onChange={e => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-gray-300 focus:outline-none focus:border-boxing-green transition-colors resize-y"
                                        placeholder="np. Limit miejsc / Regionalne / Prestiż"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Link zewnętrzny (Opcjonalnie)</label>
                                    <input
                                        type="text"
                                        value={currentEvent.link || ''}
                                        onChange={e => setCurrentEvent({ ...currentEvent, link: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-blue-400 focus:outline-none focus:border-boxing-green transition-colors"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-4">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-boxing-green text-black px-8 py-3 rounded-lg font-bold hover:bg-green-400 transition-all uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {saving ? 'Zapisywanie...' : 'Zapisz'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    // ====== LIST MODE ======
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-[#111] border border-white/5 rounded-xl overflow-hidden"
                    >
                        {/* Search Bar */}
                        <div className="p-4 border-b border-white/5 bg-black/20 focus-within:bg-black/40 transition-colors flex items-center gap-3">
                            <Search className="w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Szukaj wydarzenia..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none text-white focus:outline-none w-full"
                            />
                        </div>

                        {/* Event List */}
                        <div className="overflow-x-auto min-h-[400px]">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="w-8 h-8 animate-spin text-boxing-green" />
                                </div>
                            ) : filteredEvents.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    Brak wydarzeń w bazie.
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-black/40 text-xs text-gray-500 uppercase tracking-widest">
                                            <th className="p-4 font-bold border-b border-white/5">Data</th>
                                            <th className="p-4 font-bold border-b border-white/5">Wydarzenie</th>
                                            <th className="p-4 font-bold border-b border-white/5 whitespace-nowrap">Typ</th>
                                            <th className="p-4 font-bold border-b border-white/5">Status</th>
                                            <th className="p-4 font-bold border-b border-white/5 text-right">Akcje</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEvents.map((ev) => (
                                            <tr key={ev.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <td className="p-4 text-white text-sm whitespace-nowrap">
                                                    {formatDate(ev.date)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-white group-hover:text-boxing-green transition-colors">
                                                        {ev.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {ev.location}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-white/10 text-gray-300 text-[10px] uppercase tracking-wider px-2 py-1 rounded">
                                                        {ev.type}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => handleToggleActive(ev.id, ev.is_active)}
                                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${ev.is_active
                                                                ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                                                                : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                                                            }`}
                                                    >
                                                        {ev.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                        {ev.is_active ? 'Widoczny' : 'Ukryty'}
                                                    </button>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => { setCurrentEvent(ev); setIsEditing(true); }}
                                                            className="p-2 bg-white/5 hover:bg-white/10 rounded transition-colors text-white"
                                                            title="Edytuj"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(ev.id)}
                                                            className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded transition-colors text-gray-400"
                                                            title="Usuń trwale"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCalendar;

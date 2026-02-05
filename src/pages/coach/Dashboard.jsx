
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { coaches } from '../../data/coaches'; // Use mock coaches map if needed or just use auth user
import { Loader2, Calendar, Clock, XCircle, Save, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';

const CoachDashboard = () => {
    const { user } = useAuth();
    // Fallback ID if no auth user (demo mode) or if user.id matches the string ID in our mock data
    // In a real app, user.id would be the UUID. We might need a mapping.
    // GUID <-> 'wojciech-rewczuk'
    // For now, let's assume the user IS logged in and their ID is properly set up, 
    // OR allow a dev-override selector restricted to admin.

    // For the sake of the demo requested: I will allow selecting the coach identity if none is matched,
    // or just default to 'wojciech-rewczuk' if user is undefined to show the UI.
    const [coachId, setCoachId] = useState(null);

    const [activeTab, setActiveTab] = useState('bookings'); // bookings, settings
    const [bookings, setBookings] = useState([]);
    const [workHours, setWorkHours] = useState({ start: '08:00', end: '20:00' });
    const [loading, setLoading] = useState(false);

    // Initialize Coach ID
    useEffect(() => {
        if (user) {
            // Try to map user to coach, or just use user.id
            // For this demo, let's default to the first coach if logged in
            setCoachId('wojciech-rewczuk');
        } else {
            // Demo mode fallback
            setCoachId('wojciech-rewczuk');
        }
    }, [user]);

    useEffect(() => {
        if (!coachId) return;
        fetchData();
    }, [coachId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Get Settings
            const { data: settings } = await supabase.from('coach_settings').select('*').eq('coach_id', coachId).single();
            if (settings) {
                setWorkHours({ start: settings.work_start_time, end: settings.work_end_time });
            }

            // 2. Get Bookings
            const { data: bks } = await supabase
                .from('bookings')
                .select('*')
                .eq('coach_id', coachId)
                .neq('status', 'cancelled')
                .gte('start_time', new Date().toISOString())
                .order('start_time', { ascending: true });

            setBookings(bks || []);
        } catch (err) {
            console.error("Error fetching trainer data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!confirm('Czy na pewno chcesz odwołać ten trening? Klient otrzyma powiadomienie.')) return;

        try {
            const res = await fetch('/api/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, coachId, reason: 'Odwołane przez trenera' })
            });
            if (!res.ok) throw new Error('Failed');

            // Remove locally
            setBookings(prev => prev.filter(b => b.id !== bookingId));
            alert('Trening odwołany.');
        } catch (err) {
            alert('Błąd odwoływania.');
        }
    };

    const handleSaveSettings = async () => {
        try {
            const { error } = await supabase.from('coach_settings').upsert({
                coach_id: coachId,
                work_start_time: workHours.start,
                work_end_time: workHours.end
            }, { onConflict: 'coach_id' });

            if (error) throw error;
            alert('Ustawienia zapisane!');
        } catch (err) {
            console.error(err);
            alert('Błąd zapisu.');
        }
    };

    if (!coachId) return <div className="p-8 text-center">Wybieranie profilu...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                        Grafik <span className="text-boxing-green">Trenera</span>
                    </h1>
                    <p className="text-zinc-500 text-sm">Zarządzaj rezerwacjami i czasem pracy.</p>
                </div>

                {/* TABS */}
                <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-6 py-2 rounded-md font-bold uppercase tracking-wider text-xs transition-all ${activeTab === 'bookings' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Rezerwacje
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-2 rounded-md font-bold uppercase tracking-wider text-xs transition-all ${activeTab === 'settings' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Ustawienia
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            {activeTab === 'bookings' ? (
                <div className="space-y-4">
                    <h3 className="text-zinc-400 font-bold uppercase text-xs tracking-widest mb-4">Nadchodzące Sesje</h3>

                    {loading ? <Loader2 className="animate-spin text-boxing-green" /> : bookings.length > 0 ? (
                        bookings.map(booking => (
                            <div key={booking.id} className="bg-zinc-900/50 border border-white/5 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 hover:border-boxing-green/30 transition-all group">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="bg-black p-4 rounded-lg text-center border border-white/10 min-w-[80px] group-hover:border-boxing-green/50 transition-colors">
                                        <div className="text-2xl font-black text-white">{format(new Date(booking.start_time), 'HH:mm')}</div>
                                        <div className="text-xs text-zinc-500 uppercase font-bold">{format(new Date(booking.start_time), 'd MMM', { locale: pl })}</div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-boxing-green transition-colors">{booking.client_name}</h3>
                                        <div className="text-xs text-zinc-400 font-mono mt-1 space-x-3">
                                            <span>{booking.client_email}</span>
                                            <span>|</span>
                                            <span>{booking.client_phone}</span>
                                        </div>
                                        {booking.notes && <div className="mt-2 text-sm text-zinc-500 italic bg-black/20 p-2 rounded border-l-2 border-zinc-700">"{booking.notes}"</div>}
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    {booking.status === 'confirmed' && (
                                        <div className="px-4 py-2 bg-green-900/20 text-green-500 border border-green-900/50 rounded-lg text-xs font-bold uppercase flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Potwierdzone
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleCancel(booking.id)}
                                        className="px-6 py-2 bg-red-900/10 text-red-500 border border-red-900/20 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-900/30 transition-all flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" /> Odwołaj
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
                            <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Brak nadchodzących rezerwacji</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-2xl">
                    <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-xl mb-8">
                        <h3 className="text-lg font-bold uppercase mb-8 flex items-center gap-2 text-white">
                            <Clock className="w-5 h-5 text-boxing-green" /> Godziny Pracy (Standardowe)
                        </h3>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Początek zmiany</label>
                                <input
                                    type="time"
                                    value={workHours.start}
                                    onChange={e => setWorkHours({ ...workHours, start: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-lg p-4 text-white font-mono focus:border-boxing-green focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Koniec zmiany</label>
                                <input
                                    type="time"
                                    value={workHours.end}
                                    onChange={e => setWorkHours({ ...workHours, end: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-lg p-4 text-white font-mono focus:border-boxing-green focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveSettings}
                            className="w-full py-4 bg-boxing-green text-black font-black uppercase tracking-widest rounded-lg hover:bg-white transition-all flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" /> Zapisz Grafik
                        </button>
                    </div>

                    <div className="bg-black border border-zinc-800 p-6 rounded-xl opacity-60 hover:opacity-100 transition-opacity">
                        <h4 className="font-bold text-sm uppercase text-zinc-500 mb-2">Integracja Google Calendar</h4>
                        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                            Połączenie z kalendarzem jest zarządzane przez administratora serwera.
                            Aby zmienić kalendarz docelowy, skontaktuj się z obsługą techniczną i podaj nowe ID kalendarza.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoachDashboard;


import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { coaches } from '../../data/coaches';
import { Loader2, Calendar, Clock, XCircle, LogIn, Save } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

const TrainerPanel = () => {
    const [coachId, setCoachId] = useState(null); // Mock Auth
    const [activeTab, setActiveTab] = useState('bookings'); // bookings, settings

    // Data
    const [bookings, setBookings] = useState([]);
    const [workHours, setWorkHours] = useState({ start: '08:00', end: '20:00' });
    const [loading, setLoading] = useState(false);

    // Load Data
    useEffect(() => {
        if (!coachId) return;

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
                    .gte('start_time', new Date().toISOString()) // Upcoming only
                    .order('start_time', { ascending: true });

                setBookings(bks || []);
            } catch (err) {
                console.error("Error fetching trainer data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Realtime subscription? For now simple fetch is enough.
    }, [coachId]);

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

    // --- LOGIN SCREEN ---
    if (!coachId) return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full text-center">
                <LogIn className="w-12 h-12 text-boxing-green mx-auto mb-4" />
                <h1 className="text-2xl font-black text-white uppercase italic mb-8">Panel Trenera</h1>
                <div className="space-y-4">
                    {coaches.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setCoachId(c.id)}
                            className="w-full flex items-center gap-4 p-4 bg-black border border-zinc-800 hover:border-boxing-green rounded-xl transition-all group"
                        >
                            <img src={c.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                            <div className="text-left">
                                <div className="font-bold text-white group-hover:text-boxing-green">{c.name}</div>
                                <div className="text-xs text-zinc-500">Zaloguj się</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // --- DASHBOARD ---
    return (
        <div className="min-h-screen bg-black text-white pt-32 px-4 pb-20">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-black uppercase italic">
                        Cześć, <span className="text-boxing-green">{coaches.find(c => c.id === coachId)?.name}</span>
                    </h1>
                    <button onClick={() => setCoachId(null)} className="text-xs text-zinc-500 hover:text-white uppercase font-bold">Wyloguj</button>
                </div>

                {/* TABS */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs border transition-all ${activeTab === 'bookings' ? 'bg-boxing-green text-black border-boxing-green' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
                    >
                        Moje Treningi
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs border transition-all ${activeTab === 'settings' ? 'bg-boxing-green text-black border-boxing-green' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
                    >
                        Ustawienia Grafiku
                    </button>
                </div>

                {activeTab === 'bookings' ? (
                    <div className="space-y-4">
                        {loading ? <Loader2 className="animate-spin" /> : bookings.length > 0 ? (
                            bookings.map(booking => (
                                <div key={booking.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-black p-4 rounded-lg text-center border border-white/10 min-w-[80px]">
                                            <div className="text-2xl font-black">{format(new Date(booking.start_time), 'HH:mm')}</div>
                                            <div className="text-xs text-zinc-500 uppercase">{format(new Date(booking.start_time), 'd MMM', { locale: pl })}</div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{booking.client_name}</h3>
                                            <div className="text-sm text-zinc-400 flex flex-col gap-1">
                                                <span>{booking.client_email}</span>
                                                <span>{booking.client_phone}</span>
                                            </div>
                                            {booking.notes && <div className="mt-2 text-xs text-zinc-500 italic">"{booking.notes}"</div>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCancel(booking.id)}
                                        className="px-6 py-2 bg-red-900/20 text-red-500 border border-red-900/50 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-900/40 transition-all flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" /> Odwołaj
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-zinc-500 italic">Brak nadchodzących rezerwacji.</div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-xl">
                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl mb-8">
                            <h3 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-boxing-green" /> Godziny Pracy
                            </h3>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Początek Pracy</label>
                                    <input
                                        type="time"
                                        value={workHours.start}
                                        onChange={e => setWorkHours({ ...workHours, start: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-boxing-green focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Koniec Pracy</label>
                                    <input
                                        type="time"
                                        value={workHours.end}
                                        onChange={e => setWorkHours({ ...workHours, end: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-boxing-green focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveSettings}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" /> Zapisz Zmiany
                            </button>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                            <h4 className="font-bold text-sm uppercase text-zinc-500 mb-2">Integracja Google Calendar</h4>
                            <p className="text-xs text-zinc-400 mb-4">Aby połączyć kalendarz, skontaktuj się z administratorem i podaj ID kalendarza Google.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainerPanel;

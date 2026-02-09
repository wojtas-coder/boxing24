
import React, { useState, useEffect } from 'react';
import { coaches } from '../../data/coaches';
import { Loader2, Calendar, Clock, XCircle, Save, CheckCircle, Smartphone, AlertTriangle, Link2, RefreshCw } from 'lucide-react';
import { format, addDays, startOfToday, isSameDay, isBefore, addMinutes } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';

const CoachDashboard = () => {
    const { user } = useAuth();
    const [coachId, setCoachId] = useState(null);

    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [workHours, setWorkHours] = useState({ start: '08:00', end: '20:00' });
    const [calendarId, setCalendarId] = useState('');
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [loading, setLoading] = useState(false);

    // Status Logic
    const isCalendarConnected = calendarId && calendarId.includes('@');

    // Initialize Coach ID
    useEffect(() => {
        setCoachId('wojciech-rewczuk');
    }, [user]);

    useEffect(() => {
        if (!coachId) return;
        fetchData();
    }, [coachId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Get Settings (via Server API)
            const settingsRes = await fetch(`/api/coach-settings?coachId=${coachId}`);
            if (!settingsRes.ok) throw new Error('Failed to fetch settings');
            const { settings } = await settingsRes.json();

            if (settings) {
                setWorkHours({
                    start: settings.work_start_time ? settings.work_start_time.slice(0, 5) : '08:00',
                    end: settings.work_end_time ? settings.work_end_time.slice(0, 5) : '20:00'
                });
                setCalendarId(settings.google_calendar_id || '');
            }

            // 2. Get Bookings (via Server API)
            const bookingsRes = await fetch(`/api/coach-bookings?coachId=${coachId}`);
            if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
            const { bookings: bks } = await bookingsRes.json();

            setBookings(bks || []);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            // Non-blocking error log, UI remains functional
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

            if (!res.ok) throw new Error('Failed to cancel');

            setBookings(prev => prev.filter(b => b.id !== bookingId));
            alert('Trening odwołany.');
        } catch (err) {
            alert('Błąd: ' + err.message);
        }
    };

    const handleSaveSettings = async () => {
        try {
            const res = await fetch('/api/coach-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coachId: coachId,
                    workStart: workHours.start,
                    workEnd: workHours.end,
                    googleCalendarId: calendarId
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Server error');

            alert('Ustawienia zapisane! Dane zsynchronizowane.');
            // Refresh to confirm saved state
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Błąd zapisu: ' + err.message);
        }
    };



    if (!coachId) return <div className="p-8 text-center text-zinc-500">Wybieranie profilu...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                        Grafik <span className="text-boxing-green">Trenera</span>
                    </h1>
                    <p className="text-zinc-500 text-sm">Zarządzaj rezerwacjami, czasem pracy i integracjami.</p>
                </div>

            </div>
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/10">
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`px-6 py-2 rounded-md font-bold uppercase tracking-wider text-xs transition-all ${activeTab === 'bookings' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Rezerwacje
                </button>
                <button
                    onClick={() => setActiveTab('scheduler')}
                    className={`px-6 py-2 rounded-md font-bold uppercase tracking-wider text-xs transition-all ${activeTab === 'scheduler' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Grafik
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-6 py-2 rounded-md font-bold uppercase tracking-wider text-xs transition-all ${activeTab === 'settings' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <div className="flex items-center gap-2">
                        <span>Ustawienia</span>
                        <div className={`w-2 h-2 rounded-full ${isCalendarConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 opacity-50'}`}></div>
                    </div>
                </button>
            </div>



            {/* CONTENT */}
            {
                activeTab === 'bookings' ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Nadchodzące Sesje</h3>
                            <button onClick={fetchData} className="text-zinc-600 hover:text-white transition-colors">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-boxing-green" />
                            </div>
                        ) : bookings.length > 0 ? (
                            bookings.filter(b => b.client_name !== 'BLOKADA').map(booking => (
                                <div key={booking.id} className="bg-zinc-900/50 border border-white/5 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 hover:border-boxing-green/30 transition-all group">
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="bg-black p-4 rounded-lg text-center border border-white/10 min-w-[80px] group-hover:border-boxing-green/50 transition-colors">
                                            <div className="text-2xl font-black text-white">{format(new Date(booking.start_time), 'HH:mm')}</div>
                                            <div className="text-xs text-zinc-500 uppercase font-bold">{format(new Date(booking.start_time), 'd MMM', { locale: pl })}</div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-boxing-green transition-colors">{booking.client_name}</h3>
                                            <div className="text-xs text-zinc-400 font-mono mt-1 space-x-3 flex items-center">
                                                <span>{booking.client_email}</span>
                                                <span className="text-zinc-700">|</span>
                                                <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> {booking.client_phone}</span>
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
                ) : activeTab === 'scheduler' ? (
                    // SCHEDULER VIEW
                    <div className="space-y-8">
                        {/* DATE PICKER */}
                        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800">
                            <div className="flex gap-2 w-max mx-auto">
                                {Array.from({ length: 14 }).map((_, i) => {
                                    const date = addDays(new Date(), i);
                                    const isSelected = isSameDay(date, selectedDate);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDate(date)}
                                            className={`
                                            flex flex-col items-center justify-center w-16 h-20 rounded-xl border transition-all
                                            ${isSelected
                                                    ? 'bg-boxing-green text-black border-boxing-green scale-105'
                                                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white'
                                                }
                                        `}
                                        >
                                            <span className="text-[10px] font-bold uppercase">{format(date, 'EEE', { locale: pl })}</span>
                                            <span className="text-xl font-black">{format(date, 'd')}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* LEGEND */}
                        <div className="flex justify-center gap-6 text-xs uppercase font-bold tracking-wider">
                            <div className="flex items-center gap-2 text-boxing-green"><div className="w-3 h-3 bg-zinc-900 border border-boxing-green rounded-sm"></div>Dostępne</div>
                            <div className="flex items-center gap-2 text-zinc-500"><div className="w-3 h-3 bg-zinc-800 border-zinc-700 border rounded-sm"></div>Zajęte (Klient)</div>
                            <div className="flex items-center gap-2 text-red-500"><div className="w-3 h-3 bg-red-900/20 border-red-500 border rounded-sm"></div>Zablokowane</div>
                        </div>

                        {/* SLOTS GRID */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {(() => {
                                const slots = [];
                                // Ensure valid HH:mm format (e.g. "08:00")
                                const safeStart = workHours.start.length >= 5 ? workHours.start.slice(0, 5) : '08:00';
                                const safeEnd = workHours.end.length >= 5 ? workHours.end.slice(0, 5) : '20:00';

                                let current = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${safeStart}:00`);
                                const end = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${safeEnd}:00`);
                                const duration = 60;

                                if (isNaN(current.getTime()) || isNaN(end.getTime())) {
                                    return <div className="col-span-full text-center text-red-500">Błąd generowania grafiku (Nieprawidłowy format czasu). Sprawdź ustawienia.</div>;
                                }

                                while (current < end) {
                                    const timeStr = format(current, 'HH:mm');
                                    // Check status
                                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                                    const slotBooking = bookings.find(b => {
                                        // Match exact date and time (ignoring seconds from DB)
                                        const bDate = b.start_time.split('T')[0];
                                        const bTime = b.start_time.split('T')[1].slice(0, 5);
                                        return bDate === dateStr && bTime === timeStr && b.status !== 'cancelled';
                                    });

                                    const isBlocked = slotBooking?.client_name === 'BLOKADA';
                                    const isBooked = slotBooking && !isBlocked;

                                    slots.push(
                                        <button
                                            key={timeStr}
                                            onClick={async () => {
                                                setLoading(true);
                                                try {
                                                    if (isBlocked) {
                                                        // Unblock
                                                        await handleCancel(slotBooking.id); // Reusing Cancel Logic
                                                    } else if (isBooked) {
                                                        // Ask to cancel client booking
                                                        alert(`To miejsce jest zarezerwowane przez: ${slotBooking.client_name}. Aby je zwolnić, wejdź w zakładkę Rezerwacje.`);
                                                    } else {
                                                        // Block
                                                        const res = await fetch('/api/booking', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                coachId,
                                                                date: dateStr,
                                                                time: timeStr,
                                                                clientName: 'BLOKADA',
                                                                clientEmail: 'coach-block@boxing24.pl',
                                                                clientPhone: '-',
                                                                notes: 'Zablokowane z grafiku'
                                                            })
                                                        });
                                                        if (!res.ok) throw new Error('Błąd blokowania');
                                                        fetchData();
                                                    }
                                                } catch (e) {
                                                    alert(e.message);
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            disabled={loading}
                                            className={`
                                            p-4 rounded-xl border transition-all relative overflow-hidden group
                                            ${isBlocked
                                                    ? 'bg-red-900/10 border-red-500/50 hover:bg-red-900/30'
                                                    : isBooked
                                                        ? 'bg-zinc-800 border-zinc-700 opacity-60 cursor-not-allowed'
                                                        : 'bg-zinc-900/50 border-boxing-green/30 hover:bg-boxing-green hover:text-black hover:border-boxing-green hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                                }
                                        `}
                                        >
                                            <div className={`text-xl font-black ${isBlocked ? 'text-red-500' : isBooked ? 'text-zinc-500' : 'text-white group-hover:text-black'}`}>{timeStr}</div>
                                            <div className="text-[10px] font-bold uppercase mt-1">
                                                {isBlocked ? 'Zablokowane' : isBooked ? 'Zajęte' : 'Wolne'}
                                            </div>
                                        </button>
                                    );
                                    current = addMinutes(current, duration);
                                }
                                return slots;
                            })()}
                        </div>
                    </div>
                ) : activeTab === 'settings' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* LEFT COL: HOURS */}
                        <div>
                            <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-xl mb-8">
                                <h3 className="text-lg font-bold uppercase mb-8 flex items-center gap-2 text-white">
                                    <Clock className="w-5 h-5 text-boxing-green" /> Godziny Pracy
                                </h3>

                                <div className="space-y-6 mb-8">
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
                            </div>

                            {/* BLOCKING SLOTS CARD */}
                            <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-xl mb-8">
                                <h3 className="text-lg font-bold uppercase mb-6 flex items-center gap-2 text-white">
                                    <XCircle className="w-5 h-5 text-red-500" /> Zablokuj Termin
                                </h3>
                                <p className="text-zinc-500 text-xs mb-4">Wybierz datę i godzinę, aby wykluczyć ją z dostępności (np. urlop, sprawy prywatne).</p>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Data</label>
                                            <input
                                                type="date"
                                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500"
                                                id="block-date"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Godzina</label>
                                            <input
                                                type="time"
                                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500"
                                                id="block-time"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const date = document.getElementById('block-date').value;
                                            const time = document.getElementById('block-time').value;
                                            if (!date || !time) return alert('Wybierz datę i godzinę');

                                            if (!confirm(`Zablokować termin ${date} ${time}?`)) return;

                                            try {
                                                const res = await fetch('/api/booking', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        coachId,
                                                        date,
                                                        time,
                                                        clientName: 'BLOKADA',
                                                        clientEmail: 'coach-block@boxing24.pl', // Fake email
                                                        clientPhone: '-',
                                                        notes: 'Zablokowane przez trenera'
                                                    })
                                                });
                                                if (!res.ok) throw new Error('Błąd blokowania');
                                                alert('Termin zablokowany.');
                                                fetchData(); // Refresh calendar
                                            } catch (e) {
                                                alert(e.message);
                                            }
                                        }}
                                        className="w-full py-3 bg-red-900/20 text-red-500 border border-red-900/50 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-900/40 transition-all"
                                    >
                                        Zablokuj Termin
                                    </button>
                                </div>
                            </div>

                            {/* GOOGLE INTEGRATION CARD */}
                            <div className={`border p-8 rounded-xl transition-all ${isCalendarConnected ? 'bg-green-900/10 border-green-900/50' : 'bg-zinc-900/50 border-white/5'}`}>
                                <h3 className="text-lg font-bold uppercase mb-6 flex items-center justify-between text-white">
                                    <span className="flex items-center gap-2">
                                        <Calendar className={`w-5 h-5 ${isCalendarConnected ? 'text-green-500' : 'text-zinc-500'}`} />
                                        Integracja Google
                                    </span>

                                    {isCalendarConnected ? (
                                        <span className="text-[10px] font-black uppercase text-black bg-green-500 px-2 py-1 rounded">Aktywna</span>
                                    ) : (
                                        <span className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-800 px-2 py-1 rounded">Nieaktywna</span>
                                    )}
                                </h3>

                                <p className="text-zinc-500 text-xs mb-4 leading-relaxed">
                                    Wklej ID swojego Kalendarza Google (zazwyczaj Twój adres e-mail), aby automatycznie synchronizować treningi. Pamiętaj o dodaniu uprawnień dla bota.
                                </p>

                                <div className="mb-6">
                                    <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Google Calendar ID</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="np. jan.kowalski@gmail.com"
                                            value={calendarId}
                                            onChange={e => setCalendarId(e.target.value)}
                                            className={`w-full bg-black border rounded-lg p-4 text-white text-sm focus:outline-none transition-colors pr-12 ${isCalendarConnected ? 'border-green-900/50 focus:border-green-500' : 'border-white/10 focus:border-boxing-green'}`}
                                        />
                                        {isCalendarConnected && (
                                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                        )}
                                    </div>
                                </div>

                                {isCalendarConnected && (
                                    <div className="flex items-center gap-2 text-xs text-green-500 bg-green-900/20 p-3 rounded-lg border border-green-900/30">
                                        <Link2 className="w-4 h-4" />
                                        <span>Połączono z kontem Google</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COL: SAVE (SETTINGS ONLY) */}
                        <div className="lg:pt-8">
                            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl sticky top-8">
                                <h4 className="text-white font-bold text-lg mb-4">Podsumowanie</h4>
                                <p className="text-zinc-500 text-sm mb-8">
                                    Zmiany w grafiku i integracje są aplikowane natychmiastowo.
                                </p>
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={loading}
                                    className="w-full py-4 bg-boxing-green text-black font-black uppercase tracking-widest rounded-lg hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-5 h-5" />
                                    {loading ? 'Zapisywanie...' : 'Zapisz Ustawienia'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null
            }
        </div>
    );
};

export default CoachDashboard;

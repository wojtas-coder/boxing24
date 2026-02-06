import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, User, MapPin, Star, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { coaches } from '../data/coaches';
import { format, addDays, startOfToday, isSameDay, isBefore } from 'date-fns';
import { pl } from 'date-fns/locale';

const BookingPage = () => {
    const [step, setStep] = useState('coach_selection'); // coach_selection, calendar, success
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedDate, setSelectedDate] = useState(startOfToday());

    // Booking Form State
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [notes, setNotes] = useState('');

    // Data State
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [processingBooking, setProcessingBooking] = useState(false);
    const [message, setMessage] = useState(null); // For errors/success feedback

    const [selectedCity, setSelectedCity] = useState('ALL');

    // Extract unique cities (simple parsing)
    const uniqueCities = ['ALL', ...new Set(coaches.map(c => {
        if (c.location.includes('Warszawa')) return 'Warszawa';
        if (c.location.includes('Wrocław')) return 'Wrocław';
        if (c.location.includes('Kraków')) return 'Kraków';
        if (c.location.includes('Polska')) return 'Polska (Cały Kraj)';
        return c.location.split(' / ')[0];
    }))].sort();

    // Filter logic
    const filteredCoaches = selectedCity === 'ALL'
        ? coaches
        : coaches.filter(c => {
            if (selectedCity === 'Warszawa') return c.location.includes('Warszawa');
            if (selectedCity === 'Wrocław') return c.location.includes('Wrocław');
            if (selectedCity === 'Kraków') return c.location.includes('Kraków');
            if (selectedCity === 'Polska (Cały Kraj)') return c.location.includes('Polska');
            return c.location.startsWith(selectedCity);
        });

    // --- FETCH AVAILABILITY ---
    useEffect(() => {
        if (selectedCoach && selectedDate) {
            const fetchSlots = async () => {
                setLoadingSlots(true);
                setAvailableSlots([]);
                setSelectedSlot(null);

                try {
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    // Note: This endpoint (/api/availability) must exist. 
                    const res = await fetch(`/api/availability?coachId=${selectedCoach.id}&date=${dateStr}`);
                    const data = await res.json();

                    if (!res.ok) {
                        alert(`BŁĄD SYSTEMU (${res.status}):\n${data.error}\n\nDEBUG LOG:\n${data.debug ? data.debug.join('\n') : 'Brak logów'}`);
                        throw new Error('Błąd pobierania terminów');
                    }
                    setAvailableSlots(data.slots || []);
                } catch (err) {
                    console.error("Availability Error", err);
                    setAvailableSlots([]);
                } finally {
                    setLoadingSlots(false);
                }
            };
            fetchSlots();
        }
    }, [selectedCoach, selectedDate]);

    // --- SUBMIT BOOKING ---
    const handleBooking = async () => {
        if (!selectedSlot || !clientEmail || !clientName) return;

        setProcessingBooking(true);
        try {
            const res = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coachId: selectedCoach.id,
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    time: selectedSlot,
                    clientName,
                    clientEmail,
                    clientPhone,
                    notes
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Booking Failed');

            setStep('success');
        } catch (err) {
            console.error('Booking Failed', err);
            setMessage('Wystąpił błąd podczas rezerwacji. Spróbuj ponownie.');
        } finally {
            setProcessingBooking(false);
        }
    };

    // Generate next 14 days for date picker
    const dateOptions = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i));

    // --- VIEW: COACH SELECTION ---
    if (step === 'coach_selection') return (
        <div className="min-h-screen bg-black pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 relative">
                    {/* HERO SECTION - UNDERGROUND VIBE */}
                    <div className="relative py-12 mb-12 border-b border-white/5">
                        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
                            <img
                                src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2669&auto=format&fit=crop"
                                alt="Boxing Gym Atmosphere"
                                className="w-full h-full object-cover grayscale opacity-20 scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-zinc-500 font-bold uppercase tracking-[0.3em] mb-4 text-xs md:text-sm">
                                Boxing24 <span className="text-boxing-green mx-2">x</span> Underground Boxing Club
                            </h2>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
                                Treningi <span className="text-boxing-green">Personalne</span>
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8 font-light">
                                To nie jest fitness club. To kuźnia charakteru. <br />
                                Wybierz eksperta i trenuj w <span className="text-white font-bold">Underground Boxing Club</span>.
                            </p>
                        </div>
                    </div>

                    {/* CITY FILTER */}
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                        {uniqueCities.map(city => (
                            <button
                                key={city}
                                onClick={() => setSelectedCity(city)}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all
                                    ${selectedCity === city
                                        ? 'bg-boxing-green text-black border-boxing-green'
                                        : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-500 hover:text-white'
                                    }
                                `}
                            >
                                {city === 'ALL' ? 'Wszystkie Miasta' : city}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {filteredCoaches.map((coach, index) => (
                        <motion.div
                            key={coach.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => { setSelectedCoach(coach); setStep('calendar'); }}
                            className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-boxing-green transition-all duration-300"
                        >
                            {/* Image Placeholder */}
                            <div className="h-80 bg-zinc-800 relative overflow-hidden">
                                <img
                                    src={coach.image}
                                    alt={coach.name}
                                    className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-4">
                                    <h3 className="text-2xl font-bold uppercase italic text-white leading-none mb-1">{coach.name}</h3>
                                    <p className="text-white/90 text-[10px] font-bold uppercase tracking-widest mb-2">{coach.title}</p>
                                    <p className="text-boxing-green text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {coach.location}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6">
                                <p className="text-zinc-400 text-sm mb-4 min-h-[40px]">{coach.description}</p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {coach.specialties.map(spec => (
                                        <span key={spec} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-zinc-300 font-bold uppercase tracking-wide">
                                            {spec}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                    <div>
                                        <span className="text-zinc-500 text-xs font-bold uppercase">Cena</span>
                                        <div className="text-xl font-black text-white">{coach.price}</div>
                                    </div>
                                    <button className="w-10 h-10 rounded-full bg-boxing-green text-black flex items-center justify-center group-hover:bg-white transition-colors">
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );

    // --- VIEW: CALENDAR ---
    if (step === 'calendar') return (
        <div className="min-h-screen bg-black pt-32 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => setStep('coach_selection')}
                    className="mb-8 text-zinc-500 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Powrót do wyboru trenera
                </button>

                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* LEFT: COACH SUMMARY */}
                    <div className="w-full lg:w-1/3 bg-zinc-900/30 border border-boxing-green/30 rounded-2xl p-6">
                        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Wybrany Trener</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                                <img src={selectedCoach.image} alt={selectedCoach.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="font-bold text-white text-lg leading-none mb-1">{selectedCoach.name}</div>
                                <div className="text-boxing-green text-xs font-bold uppercase">{selectedCoach.location}</div>
                            </div>
                        </div>
                        <div className="bg-black/50 p-4 rounded-lg border border-white/5 mb-4">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase block mb-1">Specjalizacja</span>
                            <p className="text-zinc-300 text-sm">{selectedCoach.specialties.join(', ')}</p>
                        </div>
                        <div className="text-center">
                            <span className="text-4xl font-black text-white">{selectedCoach.price}</span>
                        </div>
                    </div>

                    {/* RIGHT: CALENDAR GRID */}
                    <div className="w-full lg:w-2/3">
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">Rezerwacja Terminu</h2>
                        <p className="text-zinc-400 mb-8">Wybierz dzień i godzinę treningu.</p>

                        {/* DATE SELECTOR */}
                        <div className="mb-8 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                            <div className="flex gap-3 w-max">
                                {dateOptions.map(date => {
                                    const isSelected = isSameDay(date, selectedDate);
                                    return (
                                        <button
                                            key={date.toISOString()}
                                            onClick={() => setSelectedDate(date)}
                                            className={`
                                                flex flex-col items-center justify-center w-20 h-24 rounded-xl border transition-all
                                                ${isSelected
                                                    ? 'bg-boxing-green text-black border-boxing-green scale-105'
                                                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white'
                                                }
                                                ${isBefore(date, addDays(new Date(), 0)) ? 'opacity-50 cursor-not-allowed' : ''} 
                                            `}
                                            disabled={isBefore(date, addDays(new Date(), 0))} // Only allow tomorrow+
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wider mb-1">
                                                {format(date, 'EEE', { locale: pl })}
                                            </span>
                                            <span className="text-2xl font-black">
                                                {format(date, 'd')}
                                            </span>
                                            <span className="text-[10px] uppercase">
                                                {format(date, 'MMM', { locale: pl })}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* SLOTS GRID */}
                        <div className="mb-8">
                            <h3 className="text-white font-bold uppercase text-sm mb-4 flex items-center gap-2">
                                {loadingSlots && <Loader2 className="w-4 h-4 animate-spin text-boxing-green" />}
                                Dostępne godziny
                            </h3>

                            {loadingSlots ? (
                                <div className="text-zinc-500 text-sm py-4">Sprawdzam dostępność...</div>
                            ) : availableSlots.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {availableSlots.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedSlot(time)}
                                            className={`py-3 text-center border rounded-lg font-bold text-sm transition-all 
                                                ${selectedSlot === time
                                                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white bg-zinc-900/50'
                                                }
                                            `}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 border border-red-900/30 bg-red-900/10 rounded-xl text-red-500 text-sm font-bold uppercase tracking-wide text-center">
                                    Oups. Brak wolnych terminów w tym dniu.
                                </div>
                            )}
                        </div>

                        {/* FORM */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/50 p-6 rounded-xl border border-white/5 mb-8">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Imię i Nazwisko</label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-boxing-green focus:outline-none placeholder-zinc-700"
                                    placeholder="Jan Nowak"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Numer Telefonu</label>
                                <input
                                    type="tel"
                                    value={clientPhone}
                                    onChange={e => setClientPhone(e.target.value)}
                                    placeholder="+48 000 000 000"
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white font-mono focus:border-boxing-green focus:outline-none placeholder-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Adres Email</label>
                                <input
                                    type="email"
                                    value={clientEmail}
                                    onChange={e => setClientEmail(e.target.value)}
                                    placeholder="jan@example.com"
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-boxing-green focus:outline-none placeholder-zinc-700"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Notatki (Opcjonalnie)</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-boxing-green focus:outline-none placeholder-zinc-700 h-20 resize-none"
                                    placeholder="Czy to Twój pierwszy trening bokserski?"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className="mb-4 text-red-500 font-bold text-center uppercase text-sm">
                                {message}
                            </div>
                        )}

                        <button
                            disabled={!selectedSlot || !clientName || !clientEmail || processingBooking}
                            onClick={handleBooking}
                            className={`w-full py-6 font-black uppercase tracking-widest text-lg transition-all flex items-center justify-center gap-3 rounded-lg
                                ${(!selectedSlot || !clientName || !clientEmail || processingBooking)
                                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                    : 'bg-boxing-green text-black hover:bg-white hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                                }
                            `}
                        >
                            {processingBooking ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Potwierdź Rezerwację'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- VIEW: SUCCESS ---
    if (step === 'success') return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-boxing-green/10 via-black to-black"></div>
            <div className="text-center max-w-lg relative z-10">
                <div className="w-24 h-24 bg-boxing-green rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(34,197,94,0.4)]">
                    <Check className="w-12 h-12 text-black" />
                </div>
                <h2 className="text-4xl font-black text-white uppercase italic mb-4">Trening Zarezerwowany!</h2>
                <p className="text-zinc-400 text-lg mb-8">
                    Twoja sesja z trenerem <strong>{selectedCoach?.name}</strong> została wstępnie potwierdzona na godzinę <strong>{selectedSlot}</strong> w dniu <strong>{format(selectedDate, 'dd.MM')}</strong>.
                    <br /> Potwierdzenie zostało wysłane na maila.
                </p>
                <button onClick={() => window.location.href = '/'} className="px-8 py-3 rounded-full border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Powrót do Strony Głównej
                </button>
            </div>
        </div>
    );

    return null;
};

export default BookingPage;

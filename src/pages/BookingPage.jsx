import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, User, MapPin, Star, Calendar } from 'lucide-react';
import { coaches } from '../data/coaches';

const BookingPage = () => {
    const [step, setStep] = useState('coach_selection'); // coach_selection, calendar, success
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [selectedCity, setSelectedCity] = useState('ALL');

    // Extract unique cities (simple parsing)
    // We look at the first word or known cities.
    const uniqueCities = ['ALL', ...new Set(coaches.map(c => {
        if (c.location.includes('Warszawa')) return 'Warszawa';
        if (c.location.includes('Wrocław')) return 'Wrocław';
        if (c.location.includes('Kraków')) return 'Kraków';
        if (c.location.includes('Polska')) return 'Polska (Cały Kraj)';
        return c.location.split(' / ')[0]; // Fallback to first part
    }))].sort();

    // Remove duplicates caused by fallback if needed, but Set handles it mostly.
    // Let's clean up "Polska" vs "Polska (Cały Kraj)" if needed.
    // Simpler approach: Just map raw strings and clean manually? 
    // Let's stick to the mapped values above.

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

    // --- VIEW: COACH SELECTION ---
    if (step === 'coach_selection') return (
        <div className="min-h-screen bg-black pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                        Wybierz <span className="text-boxing-green">Trenera</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
                        Treningi personalne na najwyższym poziomie. Wybierz eksperta w swoim mieście.
                    </p>

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
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => setStep('coach_selection')}
                    className="mb-8 text-zinc-500 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Powrót do wyboru trenera
                </button>

                <div className="flex flex-col md:flex-row gap-12 items-start">

                    {/* LEFT: COACH SUMMARY */}
                    <div className="w-full md:w-1/3 bg-zinc-900/30 border border-boxing-green/30 rounded-2xl p-6">
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
                    <div className="w-full md:w-2/3">
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">Rezerwacja Terminu</h2>
                        <p className="text-zinc-400 mb-8">Wybierz dostępną godzinę na trening wstępny.</p>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
                            {['10:00', '11:00', '13:00', '15:30', '17:00', '18:30', '20:00'].map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedSlot(time)}
                                    className={`py-4 text-center border rounded-lg font-bold transition-all ${selectedSlot === time ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white'}`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>

                        <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5 mb-8">
                            <label className="block text-zinc-500 text-xs font-bold uppercase mb-2">Twój Numer Telefonu</label>
                            <input type="tel" placeholder="+48 000 000 000" className="w-full bg-black border border-white/10 rounded-lg p-4 text-white font-mono focus:border-boxing-green focus:outline-none" />
                        </div>

                        <button
                            disabled={!selectedSlot}
                            onClick={() => setStep('success')}
                            className={`w-full py-6 font-black uppercase tracking-widest text-lg transition-all flex items-center justify-center gap-3
                                ${selectedSlot ? 'bg-boxing-green text-black hover:bg-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
                            `}
                        >
                            Potwierdź Rezerwację
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
                    Twoja sesja z trenerem <strong>{selectedCoach?.name}</strong> została wstępnie potwierdzona na godzinę <strong>{selectedSlot}</strong>.
                    <br /> Czekaj na SMS z potwierdzeniem.
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

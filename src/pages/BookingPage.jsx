import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import BookingCalendar from '../components/BookingCalendar';

const BookingPage = () => {
    const [step, setStep] = useState('coach_selection'); // coach_selection, calendar, success
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                const { data, error } = await supabase
                    .from('coaches')
                    .select('*')
                    .eq('is_active', true)
                    .order('order_index', { ascending: true })
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setCoaches(data || []);
            } catch (err) {
                console.error("Error fetching coaches:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCoaches();
    }, []);

    // --- VIEW: COACH SELECTION ---
    if (step === 'coach_selection') return (
        <div className="min-h-screen bg-black pt-24 md:pt-32 pb-20 px-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {coaches.map((coach, index) => (
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
        <div className="min-h-screen bg-black pt-24 md:pt-32 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => setStep('coach_selection')}
                    className="mb-8 text-zinc-500 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" /> Powrót do wyboru trenera
                </button>

                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* LEFT: COACH SUMMARY */}
                    <div className="w-full lg:w-1/3 bg-zinc-900/30 border border-boxing-green/30 rounded-2xl p-6 mb-8 lg:mb-0">
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

                    {/* RIGHT: CALENDAR EMBED */}
                    <div className="w-full lg:w-2/3">
                        <h2 className="text-3xl font-black text-white uppercase italic mb-2">Wybierz Termin</h2>
                        <p className="text-zinc-400 mb-8">System rezerwacji online.</p>

                        <BookingCalendar
                            calLink={selectedCoach.cal_link}
                            onBookingSuccess={() => setStep('success')}
                        />
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
                    Twoja sesja została pomyślnie zarezerwowana w systemie Cal.com.
                    <br /> Sprawdź swoją skrzynkę mailową.
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

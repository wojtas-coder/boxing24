import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, MapPin, Trophy, Users, Star, RefreshCw, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const CalendarPage = () => {
    const [searchParams] = useSearchParams();
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('PRO'); // Default to PRO
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const view = searchParams.get('view');
        if (view && ['PRO', 'AMATEUR'].includes(view)) {
            setFilter(view);
        }

        const fetchEvents = async () => {
            try {
                const { data, error } = await supabase
                    .from('calendar_events')
                    .select('*')
                    .eq('is_active', true)
                    .order('date', { ascending: true });

                if (error) throw error;
                // Filter out past events
                const futureEvents = (data || []).filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)));
                setEvents(futureEvents);
            } catch (err) {
                console.error("Error fetching calendar events:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [searchParams]);

    // Helper to get icon based on event type
    const getEventIcon = (type) => {
        switch (type) {
            case 'PRO': return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 'AMATEUR': return <Users className="w-5 h-5 text-blue-500" />;
            case 'OLYMPIC': return <Star className="w-5 h-5 text-red-500" />;
            default: return <CalendarIcon className="w-5 h-5 text-white" />;
        }
    };

    // Helper for type badge color
    const getTypeColor = (type) => {
        switch (type) {
            case 'PRO': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'AMATEUR': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'OLYMPIC': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-white/10 text-white border-white/20';
        }
    };

    // Filter and Sort
    const filteredEvents = events
        .filter(e => {
            if (filter === 'PRO') return (e.type === 'PRO');
            if (filter === 'AMATEUR') return (e.type === 'AMATEUR');
            return true;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                        Kalendarz <span className="text-red-600">Walk</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
                        Najważniejsze wydarzenia bokserskie w Polsce i na świecie.
                    </p>

                    {/* TABS */}
                    <div className="inline-flex bg-zinc-900 border border-white/10 rounded-full p-1 gap-1">
                        <button
                            onClick={() => setFilter('PRO')}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${filter === 'PRO' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            Zawodowcy
                        </button>
                        <button
                            onClick={() => setFilter('AMATEUR')}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${filter === 'AMATEUR' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            Amatorzy / Olimpijski
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-12 h-12 animate-spin text-red-600" />
                    </div>
                ) : (
                    <div className="space-y-6 min-h-[400px]">
                        <AnimatePresence mode="popLayout">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event, index) => (
                                    <motion.div
                                        key={event.id || index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group relative border border-white/10 bg-zinc-900/50 p-6 rounded-2xl hover:border-red-600/30 transition-all overflow-hidden"
                                    >
                                        {/* Hover Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/0 to-red-600/0 group-hover:via-red-600/5 transition-all duration-500" />

                                        <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                                            {/* Date Box */}
                                            <div className="flex-shrink-0 w-full md:w-24 h-24 bg-black border border-white/10 rounded-xl flex flex-col justify-center items-center text-center p-2 group-hover:border-red-600/50 transition-colors">
                                                <span className="text-3xl font-black text-white block leading-none mb-1">
                                                    {new Date(event.date).getDate()}
                                                </span>
                                                <span className="text-xs font-bold uppercase text-red-600 tracking-widest">
                                                    {new Date(event.date).toLocaleString('pl-PL', { month: 'short' })}
                                                </span>
                                                <span className="text-xs text-zinc-500 mt-1">
                                                    {new Date(event.date).getFullYear()}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getTypeColor(event.type)}`}>
                                                        {event.type}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-zinc-400 text-xs">
                                                        <MapPin className="w-3 h-3" />
                                                        {event.location}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-red-500 transition-colors">
                                                    {event.title}
                                                </h3>
                                                <p className="text-sm text-zinc-400">
                                                    {event.description || (event.link ? <a href={event.link} target="_blank" rel="noreferrer" className="hover:text-white underline decoration-zinc-700">Więcej informacji / Źródło</a> : 'Szczegóły wkrótce')}
                                                </p>
                                            </div>

                                            {/* Action Icon */}
                                            <div className="flex-shrink-0 self-start md:self-center">
                                                {getEventIcon(event.type)}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-zinc-500">
                                    <p>Brak nadchodzących wydarzeń w tej kategorii.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Footer CTA */}
                <div className="mt-20 p-8 border border-white/10 rounded-2xl bg-zinc-900/30 text-center">
                    <h3 className="text-2xl font-bold mb-4">Trenuj z Nami</h3>
                    <p className="text-zinc-400 mb-6">
                        Zainspirowany sukcesami na światowych ringach? Zacznij swoją przygodę z boksem we Wrocławiu.
                    </p>
                    <a href="/booking" className="inline-block px-8 py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm">
                        Zapisz się na trening
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;

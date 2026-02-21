import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { articles } from '../../data/articles';
import fileNews from '../../data/news.json';

const NewsSidebar = () => {
    const [events, setEvents] = useState([]);
    const [popular, setPopular] = useState(fileNews.slice(0, 5));
    const [calendarFilter, setCalendarFilter] = useState('PRO'); // Default PRO for Sidebar

    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch Calendar from Supabase
            try {
                const { data, error } = await supabase
                    .from('calendar_events')
                    .select('*')
                    .eq('is_active', true)
                    .order('date', { ascending: true });

                if (!error && data) {
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    const futureEvents = data.filter(e => new Date(e.date) >= now);
                    setEvents(futureEvents);
                }
            } catch (e) { }

            // 2. Fetch Popular (Real View Data from Supabase)
            try {
                const { data: viewData, error } = await supabase
                    .from('article_views')
                    .select('*')
                    .order('views', { ascending: false })
                    .limit(10);

                if (!error && viewData && viewData.length > 0) {
                    const validExpertSlugs = articles.map(a => a.id);
                    const validFileSlugs = fileNews.map(n => n.slug);

                    const verifiedPopular = viewData.filter(item =>
                        validFileSlugs.includes(item.slug) || validExpertSlugs.includes(item.slug)
                    ).slice(0, 5);

                    if (verifiedPopular.length > 0) {
                        setPopular(verifiedPopular);
                    }
                }
            } catch (e) {
                // If fails, we keep default (Latest File News)
            }
        };

        fetchData();
    }, []);

    const results = [
        { winner: 'C. Walsh', loser: 'C. Ocampo', result: 'UD 10', event: 'Zuffa Boxing 1' },
        { winner: 'R. Muratalla', loser: 'A. Cruz', result: 'SD 12', event: 'Las Vegas Fight Night' },
        { winner: 'J. Rodriguez', loser: 'C. Sandoval', result: 'KO 7', event: 'Zuffa Boxing 1' },
    ];

    // Filter events for display
    const displayedEvents = events
        .filter(e => {
            if (calendarFilter === 'PRO') return e.type === 'PRO';
            // Amateur/Olympic/Special
            return e.type !== 'PRO';
        })
        .slice(0, 5); // Take top 5 of filtered

    return (
        <div className="space-y-8">
            {/* Ad Block (Sales Module) */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-white font-black uppercase text-xl mb-2 relative z-10">
                    Zainspirowany? <span className="text-red-500">Pora na Twój ruch!</span>
                </h3>
                <p className="text-zinc-400 text-sm mb-4 relative z-10">
                    Pakiety Online lub Treningi Personalne we Wrocławiu. Promocja startowa tylko dzisiaj!
                </p>
                <Link to="/membership" className="inline-block bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-red-500 transition-colors relative z-10">
                    Odbierz Promocję
                </Link>
            </div>

            {/* Recent Results */}
            <div className="bg-black border border-zinc-800">
                <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase text-white tracking-widest flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" /> Wyniki
                    </h3>
                </div>
                <div className="divide-y divide-zinc-800">
                    {results.map((fight, i) => (
                        <div key={i} className="p-3 hover:bg-zinc-900/50 transition-colors cursor-pointer">
                            <div className="flex justify-between items-center text-sm font-bold text-white mb-1">
                                <span>{fight.winner}</span>
                                <span className="text-green-500 text-xs bg-green-500/10 px-1 rounded">WIN</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-zinc-500">
                                <span>vs {fight.loser}</span>
                                <span>{fight.result}</span>
                            </div>
                            <div className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">
                                {fight.event}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming Fights (Calendar) */}
            <div className="bg-black border border-zinc-800">
                <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase text-white tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-500" /> Kalendarz Wydarzeń
                    </h3>
                    {/* Toggles */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCalendarFilter('PRO')}
                            className={`text-[10px] px-2 py-1 uppercase font-bold transition-colors ${calendarFilter === 'PRO' ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            PRO
                        </button>
                        <button
                            onClick={() => setCalendarFilter('AMATEUR')}
                            className={`text-[10px] px-2 py-1 uppercase font-bold transition-colors ${calendarFilter === 'AMATEUR' ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            OLIMP
                        </button>
                    </div>
                </div>
                <div className="divide-y divide-zinc-800">
                    {displayedEvents.length > 0 ? displayedEvents.map((event) => (
                        <div key={event.id} className="p-3 hover:bg-zinc-900/50 transition-colors cursor-pointer">
                            <div className="flex flex-col text-sm text-white font-medium mb-1">
                                <span>{event.title}</span>
                            </div>
                            <div className="flex justify-between text-xs text-zinc-500">
                                <span className="text-red-500 font-bold">{event.date ? new Date(event.date).toLocaleDateString('pl-PL') : ''}</span>
                                <span>{event.location}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="p-4 text-center text-zinc-600 text-xs">
                            Brak nadchodzących wydarzeń w tej kategorii.
                        </div>
                    )}
                </div>
            </div>

            {/* Trending / Popular */}
            <div className="bg-black border border-zinc-800 p-4">
                <h3 className="text-sm font-bold uppercase text-white tracking-widest border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" /> Popularne
                </h3>
                <ul className="space-y-3">
                    {popular.length > 0 ? popular.map((item, index) => (
                        <li key={item.slug} className="text-sm text-zinc-300 hover:text-red-500 cursor-pointer transition-colors block leading-tight">
                            <Link to={`/news/${item.slug}`} className="block">
                                <span className="text-red-600 font-bold mr-2">{index + 1}.</span>
                                {item.title || item.slug}
                            </Link>
                        </li>
                    )) : (
                        <li className="text-sm text-zinc-500 italic">
                            Jeszcze nikt nic nie czytał...
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default NewsSidebar;

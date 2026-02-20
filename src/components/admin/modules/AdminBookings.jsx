import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
    Calendar, Search, Loader2, CheckCircle, XCircle,
    Clock, AlertTriangle, User, UserX, UserCheck
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

// Map of coach names mapping (usually dynamic, but we can map known IDs or just fetch names if joined)
// In Boxing24, coaches are usually static or fetched from auth, but let's try to map them if possible
const COACH_NAMES = {
    'e1679220-0798-471b-912e-b1e861e3c30c': 'Wojciech Rewczuk',
    'adam-bylina-coach-id-placeholder': 'Adam Bilina'
};

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, confirmed, cancelled
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('start_time', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setActionLoading(id);
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setBookings(bookings.map(book =>
                book.id === id ? { ...book, status: newStatus } : book
            ));
        } catch (error) {
            console.error('Error updating booking status:', error);
            alert('Wystąpił błąd podczas zmiany statusu.');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredBookings = bookings.filter(book => {
        const matchesSearch =
            book.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.client_email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || book.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded-md text-xs font-bold uppercase flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Potwierdzone</span>;
            case 'cancelled':
                return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded-md text-xs font-bold uppercase flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Anulowane</span>;
            case 'pending':
                return <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-1 rounded-md text-xs font-bold uppercase flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Oczekujące</span>;
            default:
                return <span className="text-zinc-500">{status}</span>;
        }
    };

    // Filter Blocks vs Real Bookings
    const blocks = filteredBookings.filter(b => b.client_name === 'BLOKADA');
    const realBookings = filteredBookings.filter(b => b.client_name !== 'BLOKADA');

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-red-600" />
                        Rezerwacje <span className="text-red-600">Treningów</span>
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold">Zarządzaj grafikiem i wizytami</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Szukaj klienta po nazwisku lub e-mail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#111] border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500/50 text-sm font-mono"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'confirmed', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border ${filterStatus === status
                                    ? 'bg-white text-black border-white'
                                    : 'bg-[#111] text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-600'
                                }`}
                        >
                            {status === 'all' ? 'Wszystkie' :
                                status === 'pending' ? 'Oczekujące' :
                                    status === 'confirmed' ? 'Zatwierdzone' : 'Anulowane'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-12 text-center">
                    <Calendar className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Brak rezerwacji</h3>
                    <p className="text-zinc-500">Nie znaleziono rezerwacji spełniających podane kryteria.</p>
                </div>
            ) : (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Data & Czas</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Klient</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Trener</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {realBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-white">
                                                {format(parseISO(booking.start_time), 'dd MMM yyyy', { locale: pl })}
                                            </div>
                                            <div className="text-zinc-500 text-sm font-mono mt-1">
                                                {format(parseISO(booking.start_time), 'HH:mm')} - {format(parseISO(booking.end_time), 'HH:mm')}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-white flex items-center gap-2">
                                                <User className="w-4 h-4 text-zinc-600" />
                                                {booking.client_name}
                                            </div>
                                            <div className="text-zinc-500 text-sm mt-1">{booking.client_email}</div>
                                        </td>
                                        <td className="p-4 text-zinc-400 font-mono text-xs">
                                            {COACH_NAMES[booking.coach_id] || 'Nieznany Trener'}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {booking.status === 'pending' && (
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                        disabled={actionLoading === booking.id}
                                                        className="text-green-500 bg-green-500/10 hover:bg-green-500/20 p-2 rounded-lg transition-colors border border-green-500/20"
                                                        title="Zatwierdź"
                                                    >
                                                        {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                        disabled={actionLoading === booking.id}
                                                        className="text-red-500 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition-colors border border-red-500/20"
                                                        title="Odrzuć"
                                                    >
                                                        {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {blocks.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Blokady Trenerów
                    </h3>
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {blocks.map(block => (
                            <div key={block.id} className="bg-[#111] border border-zinc-800 p-4 rounded-xl">
                                <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">Blokada Grafiku</span>
                                <div className="text-white font-bold">{format(parseISO(block.start_time), 'dd MMM yyyy', { locale: pl })}</div>
                                <div className="text-zinc-500 text-sm font-mono mt-1 mb-3">
                                    {format(parseISO(block.start_time), 'HH:mm')} - {format(parseISO(block.end_time), 'HH:mm')}
                                </div>
                                <div className="text-xs text-zinc-600 truncate">Trener: {COACH_NAMES[block.coach_id] || 'Nieznany'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookings;

import React, { useEffect, useState } from 'react';
import { supabaseData as supabase } from '../../../lib/supabaseClient';
import { Mail, Send, Users, Trash2, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminEmail = () => {
    const { session } = useAuth();
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    // Newsletter Form State
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchErr } = await supabase
                .from('subscribers')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchErr) throw fetchErr;
            setSubscribers(data || []);
        } catch (err) {
            console.error("Subscribers Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNewsletter = async () => {
        if (!subject || !content) return alert("Temat i treść są wymagane.");
        if (!window.confirm(`Czy na pewno chcesz wysłać ten newsletter do ${subscribers.filter(s => s.is_active).length} subskrybentów?`)) return;

        setSending(true);
        setError(null);
        setSuccessMsg('');

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    subject,
                    htmlContent: content,
                    previewText: subject
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Błąd serwera');

            setSuccessMsg(result.message);
            setSubject('');
            setContent('');
        } catch (err) {
            console.error("Newsletter Send Error:", err);
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const { error } = await supabase
            .from('subscribers')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) alert(error.message);
        else fetchSubscribers();
    };

    const deleteSubscriber = async (id) => {
        if (!window.confirm("Usunąć subskrybenta?")) return;
        const { error } = await supabase
            .from('subscribers')
            .delete()
            .eq('id', id);

        if (error) alert(error.message);
        else fetchSubscribers();
    };

    if (loading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Ładowanie listy mailingowej...</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                    Kampanie <span className="text-red-600">Email</span>
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Newsletter & Powiadomienia</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Send Newsletter Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Send className="w-5 h-5 text-red-500" />
                            <h3 className="text-white font-bold uppercase tracking-wider">Nowy Newsletter</h3>
                        </div>

                        <div className="space-y-4">
                            <input
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="Temat wiadomości"
                                className="w-full bg-black border border-zinc-700 p-4 text-white rounded-xl focus:border-red-600 outline-none transition-all"
                            />
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Treść HTML (możesz używać h1, p, img, a...)"
                                rows={10}
                                className="w-full bg-black border border-zinc-700 p-4 text-white rounded-xl focus:border-red-600 outline-none transition-all font-mono text-sm"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-sm">
                                <XCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center gap-3 text-sm">
                                <CheckCircle className="w-4 h-4" /> {successMsg}
                            </div>
                        )}

                        <button
                            onClick={handleSendNewsletter}
                            disabled={sending || subscribers.length === 0}
                            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white py-4 font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center justify-center gap-3"
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                            {sending ? 'Wysyłanie...' : 'Wyślij do wszystkich'}
                        </button>

                        <div className="flex items-center gap-2 text-zinc-600 text-[10px] uppercase font-bold tracking-widest justify-center">
                            <Info className="w-3 h-3" />
                            Wiadomość zostanie wysłana do {subscribers.filter(s => s.is_active).length} osób
                        </div>
                    </div>
                </div>

                {/* Subscribers List */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-zinc-500" />
                                <h3 className="text-white font-bold uppercase tracking-wider">Subskrybenci</h3>
                            </div>
                            <span className="bg-white/5 px-3 py-1 rounded-full text-zinc-400 text-xs font-mono">{subscribers.length}</span>
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {subscribers.map((sub) => (
                                <div key={sub.id} className="group bg-black/30 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-white/10 transition-all">
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-medium truncate ${sub.is_active ? 'text-white' : 'text-zinc-600 line-through'}`}>
                                            {sub.email}
                                        </div>
                                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest">
                                            {new Date(sub.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleStatus(sub.id, sub.is_active)}
                                            className={`p-2 rounded-lg transition-colors ${sub.is_active ? 'text-green-500 hover:bg-green-500/10' : 'text-zinc-600 hover:text-white'}`}
                                        >
                                            {sub.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => deleteSubscriber(sub.id)}
                                            className="p-2 text-zinc-800 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {subscribers.length === 0 && (
                                <div className="text-center py-10 text-zinc-600 text-sm italic">Brak subskrybentów.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEmail;

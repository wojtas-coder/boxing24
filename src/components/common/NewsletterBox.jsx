import React, { useState } from 'react';
import { supabaseData as supabase } from '../../lib/supabaseClient';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NewsletterBox = ({ variant = 'default' }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const { error } = await supabase
                .from('subscribers')
                .insert([{ email }]);

            if (error) {
                if (error.code === '23505') {
                    setMessage('Ten email jest już w naszej bazie.');
                } else {
                    throw error;
                }
                setStatus('error');
            } else {
                setStatus('success');
                setMessage('Dziękujemy! Zostałeś zapisany do newslettera.');
                setEmail('');
            }
        } catch (err) {
            console.error('Newsletter error:', err);
            setMessage('Wystąpił błąd. Spróbuj ponownie później.');
            setStatus('error');
        }
    };

    if (variant === 'footer') {
        return (
            <div className="space-y-4">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Newsletter</h4>
                <p className="text-zinc-500 text-xs">Otrzymuj techniczne analizy i newsy na maila.</p>
                <form onSubmit={handleSubmit} className="relative group">
                    <input
                        type="email"
                        required
                        placeholder="Twój email"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all pr-12"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === 'loading' || status === 'success'}
                    />
                    <button
                        type="submit"
                        disabled={status === 'loading' || status === 'success'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                        {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
                <AnimatePresence>
                    {message && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`text-[10px] font-bold uppercase tracking-widest ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}
                        >
                            {message}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <section className="py-20 px-4 relative overflow-hidden bg-zinc-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/5 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <span className="text-red-500 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Bądź na bieżąco</span>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6 leading-none">
                    Dołącz do <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">Boxing24 Inside</span>
                </h2>
                <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
                    Zapisz się do newslettera, aby otrzymywać ekskluzywne analizy walk, poradniki treningowe i powiadomienia o nowych artykułach bezpośrednio na swoją skrzynkę.
                </p>

                <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            required
                            placeholder="Wprowadź swój adres e-mail"
                            className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-red-600/50 transition-all font-medium disabled:opacity-50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === 'loading' || status === 'success'}
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                        >
                            {status === 'loading' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : status === 'success' ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                <>
                                    Zapraszamy
                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mt-6 p-4 rounded-xl border flex items-center gap-3 justify-center ${status === 'success'
                                        ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                                    }`}
                            >
                                {status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <span className="text-sm font-bold uppercase tracking-widest">{message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </section>
    );
};

export default NewsletterBox;

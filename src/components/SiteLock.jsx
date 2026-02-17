import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';

const SiteLock = ({ children }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Build-time bypass for production if needed
        if (import.meta.env.VITE_SITE_UNLOCK === 'true') {
            setIsUnlocked(true);
            setLoading(false);
            return;
        }

        const sessionUnlocked = sessionStorage.getItem('b24_unlocked');
        if (sessionUnlocked === 'true') {
            setIsUnlocked(true);
        }
        setLoading(false);
    }, []);

    const handleUnlock = (e) => {
        e.preventDefault();
        // Client-side protection
        if (password.toLowerCase() === 'boxing2420' || password === 'admin') {
            sessionStorage.setItem('b24_unlocked', 'true');
            setIsUnlocked(true);
        } else {
            setError(true);
        }
    };

    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-zinc-900 border border-white/5 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="mx-auto w-16 h-16 bg-boxing-green/10 rounded-full flex items-center justify-center mb-6 border border-boxing-green">
                    <Lock className="w-8 h-8 text-boxing-green" />
                </div>

                <h2 className="text-2xl font-black text-white uppercase italic mb-2">Boxing24 Staging</h2>
                <p className="text-gray-400 mb-8 text-sm">To jest wersja robocza. Wprowadź kod dostępu.</p>

                <form onSubmit={handleUnlock} className="space-y-4">
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Kod Dostępu"
                            className={`w-full bg-black border ${error ? 'border-red-500' : 'border-white/10'} text-white px-4 py-3 rounded-lg focus:outline-none focus:border-boxing-green text-center tracking-widest uppercase font-bold transition-colors`}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-boxing-green text-black font-black uppercase tracking-widest py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                        <Unlock className="w-4 h-4" />
                        Odblokuj
                    </button>

                    {error && (
                        <p className="text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">Nieprawidłowy kod</p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SiteLock;

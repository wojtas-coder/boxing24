import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebug = () => {
    const { session, user, profile, loading, isPremium, isAdmin } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-[9999] bg-red-600 text-white px-2 py-1 text-xs font-mono rounded opacity-50 hover:opacity-100"
            >
                DEBUG AUTH
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/90 text-green-400 p-4 border border-green-900 rounded shadow-xl font-mono text-xs max-w-sm overflow-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-2">
                <strong className="text-white">Auth Debugger</strong>
                <button onClick={() => setIsOpen(false)} className="text-red-500 hover:text-white">X</button>
            </div>

            <div className="space-y-1">
                <div><strong>Loading:</strong> {loading ? 'TRUE' : 'FALSE'}</div>
                <div><strong>Session:</strong> {session ? 'YES' : 'NO'}</div>
                <div><strong>User ID:</strong> {user?.id || 'null'}</div>
                <div><strong>Email:</strong> {user?.email || 'null'}</div>
                <div className="border-t border-white/20 my-1 pt-1">
                    <strong>Profile:</strong> {profile ? 'LOADED' : 'MISSING'}
                </div>
                <div><strong>Role:</strong> {profile?.role || 'null'}</div>
                <div><strong>Membership:</strong> {profile?.membership_status || 'null'}</div>
                <div><strong>IsAdmin:</strong> {isAdmin ? 'YES' : 'NO'}</div>
                <div><strong>IsPremium:</strong> {isPremium ? 'YES' : 'NO'}</div>
            </div>

            <div className="mt-2 text-[10px] text-zinc-500">
                LocalStorage: {Object.keys(localStorage).filter(k => k.includes('supabase')).join(', ') || 'EMPTY'}
            </div>
        </div>
    );
};

export default AuthDebug;

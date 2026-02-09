
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';
import MemberPage from './MemberPage';

const MemberPageWrapper = () => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-boxing-green">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    // Optional: block access if profile creation failed totally?
    // For now let's just render MemberPage, it handles missing profile gracefully (we hope).
    // But let's add an Error Boundary concept visually.

    try {
        return <MemberPage />;
    } catch (err) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl text-white font-bold mb-2">Coś poszło nie tak</h2>
                <p className="text-zinc-500 mb-4">Wystąpił błąd podczas ładowania profilu. Spróbuj odświeżyć stronę.</p>
                <button onClick={() => window.location.reload()} className="bg-white text-black px-6 py-2 rounded-full font-bold uppercase">
                    Odśwież
                </button>
            </div>
        );
    }
};

export default MemberPageWrapper;

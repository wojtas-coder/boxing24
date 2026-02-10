
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import MemberPage from './MemberPage';
import ErrorBoundary from '../components/ErrorBoundary';

const MemberPageWrapper = () => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-boxing-green">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <MemberPage />
        </ErrorBoundary>
    );
};

export default MemberPageWrapper;

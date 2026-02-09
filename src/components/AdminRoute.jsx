
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-boxing-green">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    if (!user || !isAdmin) {
        // Redirect non-admins to home or member page
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;

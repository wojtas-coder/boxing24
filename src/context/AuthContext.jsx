
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hardcoded admin emails (fallback if profile is missing/broken)
    const ADMIN_EMAILS = ['wojtekrewczuk@gmail.com', 'treningiboxing24@gmail.com'];

    const fetchProfile = async (userId, email = null, userMeta = null) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                // If user is in admin emails list but profile doesn't have admin role, fix it
                if (email && ADMIN_EMAILS.includes(email.toLowerCase()) && data.role !== 'admin') {
                    const { error: updateErr } = await supabase
                        .from('profiles')
                        .update({ role: 'admin', membership_status: 'member' })
                        .eq('id', userId);
                    if (!updateErr) {
                        data.role = 'admin';
                        data.membership_status = 'member';
                    }
                }
                console.log("Profile loaded:", data);
                setProfile(data);
            } else {
                console.warn("Profile missing. Attempting to create one...");
                const isAdmin = email && ADMIN_EMAILS.includes(email.toLowerCase());
                const newProfile = {
                    id: userId,
                    full_name: userMeta?.full_name || email?.split('@')[0] || 'User',
                    role: isAdmin ? 'admin' : 'client',
                    membership_status: isAdmin ? 'member' : 'Free'
                };

                // Try to insert - may fail if columns are out of sync, that's ok
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert([newProfile]);

                if (insertError) {
                    console.error("Failed to create profile:", insertError);
                }
                // Always set profile in local state so app works
                setProfile(newProfile);
            }
        } catch (err) {
            console.error("Unexpected error fetching profile:", err);
            // Fallback: set minimal profile so app doesn't break
            if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
                setProfile({ id: userId, role: 'admin', membership_status: 'member', full_name: email.split('@')[0] });
            } else {
                setProfile({ id: userId, role: 'client', membership_status: 'Free', full_name: email?.split('@')[0] || 'User' });
            }
        }
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                // Failsafe timeout
                const timeoutId = setTimeout(() => {
                    if (mounted && loading) {
                        console.warn("Auth stuck, forcing load");
                        setLoading(false);
                    }
                }, 5000);

                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        await fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
                    }
                }
                clearTimeout(timeoutId);
            } catch (err) {
                console.error("Auth Init Error:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            console.log("Auth Event:", event);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        session,
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin' || false,
        isTrainer: profile?.role === 'trainer' || false,
        isPremium: ['member', 'premium', 'vip', 'admin'].includes(profile?.membership_status?.toLowerCase()) || profile?.role === 'admin' || false,
        userRole: profile?.role || 'client',
        membershipStatus: profile?.membership_status || 'Free',
        login: async (email, password) => {
            // Timeout promise
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timout')), 10000));

            const request = supabase.auth.signInWithPassword({ email, password });

            const { error } = await Promise.race([request, timeout]);
            if (error) throw error;
        },
        loginSocial: async (provider) => {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/members`, // Auto-redirect to members area
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
            return data;
        },
        sendMagicLink: async (email) => {
            const { data, error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/members`,
                    shouldCreateUser: true, // Allow registration via magic link
                    data: {
                        full_name: email.split('@')[0], // Fallback name
                    }
                },
            });
            if (error) throw error;
            return data;
        },
        signUp: async (email, password, fullName) => {
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timout')), 10000));

            const request = supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName }
                }
            });

            const { data, error } = await Promise.race([request, timeout]);
            if (error) throw error;
            return data;
        },
        logout: async () => {
            try {
                // Race between signOut and timeout
                const signOutPromise = supabase.auth.signOut();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Logout timeout')), 2000)
                );

                const { error } = await Promise.race([signOutPromise, timeoutPromise]);
                if (error) {
                    console.error("Logout error:", error);
                    throw error;
                }
            } catch (err) {
                console.error("Logout failed:", err);
                // Don't throw - let UI handle forced logout
            }
            // State clearing is handled by onAuthStateChange listener
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen bg-black flex flex-col items-center justify-center text-boxing-green">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Ładowanie systemu...</p>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};


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

    const fetchProfile = async (userId, email = null, userMeta = null) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                console.log("Profile loaded:", data); // DEBUG
                setProfile(data);
            } else {
                console.warn("Profile missing. Attempting to create one...");
                if (email) {
                    const newProfile = {
                        id: userId,
                        full_name: userMeta?.full_name || email?.split('@')[0],
                        role: 'client',
                        membership_status: 'Free'
                    };

                    const { error: insertError } = await supabase
                        .from('profiles')
                        .insert([newProfile]);

                    if (!insertError) {
                        setProfile(newProfile);
                    } else {
                        console.error("Failed to create profile:", insertError);
                        // Still set local profile so app doesn't break
                        setProfile(newProfile);
                    }
                }
            }
        } catch (err) {
            console.error("Unexpected error fetching profile:", err);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async (retries = 3) => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (!mounted) return;

                if (error) {
                    // Handle AbortError by retrying
                    if ((error.name === 'AbortError' || error.message?.includes('abort')) && retries > 0) {
                        console.warn(`Auth session check aborted. Retrying in 500ms... (${retries} attempts left)`);
                        setTimeout(() => initAuth(retries - 1), 500);
                        return; // Skip setting loading false, keep spinner
                    }
                    throw error;
                }

                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
                }
                // Success - stop loading
                if (mounted) setLoading(false);

            } catch (err) {
                console.error("Auth Init Error:", err);
                // Failure - stop loading
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // Safety Fuse: Force loading to false after 3 seconds if it's still true
        const safetyTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth check timed out - forcing app to load");
                setLoading(false);
            }
        }, 3000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!mounted) return;
            console.log("Auth Event Handled:", event);

            // Critical events that should trigger state refresh
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                if (currentSession?.user) {
                    await fetchProfile(currentSession.user.id, currentSession.user.email, currentSession.user.user_metadata);
                }
            }

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setProfile(null);
            }

            setLoading(false);
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
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
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        },
        loginSocial: async (provider) => {
            // Force clean origin to avoid redirect loops
            const redirectUrl = `${window.location.origin}/members`;

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: redirectUrl,
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
                    shouldCreateUser: true,
                    data: {
                        full_name: email.split('@')[0],
                    }
                },
            });
            if (error) throw error;
            return data;
        },
        signUp: async (email, password, fullName) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName }
                }
            });
            if (error) throw error;
            return data;
        },
        logout: async () => {
            try {
                // Clear state IMMEDIATELY (Optimistic Logout)
                setSession(null);
                setUser(null);
                setProfile(null);

                // Attempt server-side sign out with timeout
                const signOutPromise = supabase.auth.signOut();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Logout timeout')), 2500)
                );

                await Promise.race([signOutPromise, timeoutPromise]);
            } catch (err) {
                console.error("Logout process cleanup:", err);
            } finally {
                // Final safety: ensure everything is gone and redirect
                setLoading(false);
                // Clear potential leftover crumbs in localStorage
                Object.keys(localStorage).forEach(key => {
                    if (key.includes('supabase.auth.token')) localStorage.removeItem(key);
                });
            }
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


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
                // Don't let errors bubble up since user wants to leave
            }
            // State clearing is handled by onAuthStateChange listener
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

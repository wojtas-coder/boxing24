
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
    const [profileLoading, setProfileLoading] = useState(false);

    const fetchProfile = async (userId, email = null, userMeta = null) => {
        if (!userId) return;
        setProfileLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                console.log("Profile loaded:", data);
                setProfile(data);
            } else if (email) {
                console.warn("Profile missing. Creating fallback...");
                const newProfile = {
                    id: userId,
                    full_name: userMeta?.full_name || email?.split('@')[0],
                    role: 'client',
                    membership_status: 'Free'
                };
                setProfile(newProfile);
                // Background attempt to create
                supabase.from('profiles').insert([newProfile]).then(({ error: e }) => {
                    if (e) console.error("Profile creation failed:", e);
                });
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                // Check if we have a "just logged out" flag to prevent resurrection
                if (sessionStorage.getItem('b24_logout_pending')) {
                    setLoading(false);
                    return;
                }

                const { data: { session: initialSession } } = await supabase.auth.getSession();
                if (!mounted) return;

                if (initialSession) {
                    setSession(initialSession);
                    setUser(initialSession.user);
                    await fetchProfile(initialSession.user.id, initialSession.user.email, initialSession.user.user_metadata);
                }
            } catch (err) {
                console.error("Auth Init Error:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!mounted) return;
            console.log("Auth Event:", event);

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            if (currentSession) {
                setSession(currentSession);
                setUser(currentSession.user);
                // Only fetch if profile missing or user changed
                if (!profile || profile.id !== currentSession.user.id) {
                    await fetchProfile(currentSession.user.id, currentSession.user.email, currentSession.user.user_metadata);
                }
            } else if (event !== 'INITIAL_SESSION') {
                setSession(null);
                setUser(null);
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
        loading: loading || profileLoading, // Combined loading for more stable UI
        isAdmin: profile?.role === 'admin' || false,
        isTrainer: profile?.role === 'trainer' || false,
        isPremium: ['member', 'premium', 'vip', 'admin'].includes(profile?.membership_status?.toLowerCase()) || profile?.role === 'admin' || false,
        userRole: profile?.role || 'client',
        membershipStatus: profile?.membership_status || 'Free',
        login: async (email, password) => {
            sessionStorage.removeItem('b24_logout_pending');
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        },
        loginSocial: async (provider) => {
            sessionStorage.removeItem('b24_logout_pending');
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/members`,
                    queryParams: { access_type: 'offline', prompt: 'consent' },
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
                // 1. Mark as logging out to prevent resurrection during refresh
                sessionStorage.setItem('b24_logout_pending', 'true');

                // 2. Optimistic State Clear
                setSession(null);
                setUser(null);
                setProfile(null);

                // 3. Aggressive Storage Purge
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.includes('supabase') || key.includes('auth-token')) {
                        localStorage.removeItem(key);
                    }
                });

                // 4. Server Sign Out (Global) with short timeout
                await Promise.race([
                    supabase.auth.signOut({ scope: 'global' }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
                ]);
            } catch (err) {
                console.warn("Logout cleanup warning:", err);
            } finally {
                // Force hard reload to guarantee clean state
                window.location.href = '/';
            }
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

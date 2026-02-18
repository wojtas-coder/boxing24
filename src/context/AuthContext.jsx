
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

    // Profile sync with retries
    const syncProfile = async (userId, email, metadata, retry = 2) => {
        if (!userId) return null;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile(data);
                return data;
            } else if (email) {
                // Fallback / Creation
                const fallback = {
                    id: userId,
                    full_name: metadata?.full_name || email.split('@')[0],
                    role: 'client',
                    membership_status: 'Free'
                };
                setProfile(fallback);
                await supabase.from('profiles').upsert(fallback);
                return fallback;
            }
        } catch (err) {
            console.error("Profile sync attempt failed:", err);
            if (retry > 0) {
                await new Promise(r => setTimeout(r, 500));
                return syncProfile(userId, email, metadata, retry - 1);
            }
        }
        return null;
    };

    useEffect(() => {
        let mounted = true;
        let initPromise = null;

        const initialize = async () => {
            try {
                // 1. Check for recent logout to prevent 'ghost' sessions
                const lastLogout = localStorage.getItem('b24_last_logout');
                if (lastLogout && Date.now() - parseInt(lastLogout) < 2000) {
                    console.log("Blocking ghost session recovery...");
                    return;
                }

                // 2. Recovery session
                const { data: { session: recovered } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (recovered) {
                    console.log("Session recovered:", recovered.user.email);
                    setSession(recovered);
                    setUser(recovered.user);
                    // 3. WAIT for profile before unlocking UI
                    await syncProfile(recovered.user.id, recovered.user.email, recovered.user.user_metadata);
                } else {
                    console.log("No session found during recovery.");
                }
            } catch (err) {
                console.error("Auth Boot Error:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // Start initialization
        initPromise = initialize();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (!mounted) return;
            console.log("Auth Event:", event);

            // Wait for initial boot to finish before processing events that might clear loading
            if (loading) await initPromise;

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            if (currentSession) {
                const isNewUser = !user || user.id !== currentSession.user.id;
                setSession(currentSession);
                setUser(currentSession.user);

                // Only sync profile if user changed or profile missing
                if (isNewUser || !profile) {
                    await syncProfile(currentSession.user.id, currentSession.user.email, currentSession.user.user_metadata);
                }
            } else if (event !== 'INITIAL_SESSION') {
                setSession(null);
                setUser(null);
                setProfile(null);
            }

            if (mounted) setLoading(false);
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
        isPremium: ['member', 'premium', 'vip', 'admin'].includes(profile?.membership_status?.toLowerCase()) || false,
        userRole: profile?.role || 'client',
        membershipStatus: profile?.membership_status || 'Free',
        login: async (email, password) => {
            localStorage.removeItem('b24_last_logout');
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        },
        loginSocial: async (provider) => {
            localStorage.removeItem('b24_last_logout');
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
                // 1. Mark logout time & state to prevent resurrection
                localStorage.setItem('b24_last_logout', Date.now().toString());
                sessionStorage.setItem('b24_logout_pending', 'true');

                // 2. Clear state immediately
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

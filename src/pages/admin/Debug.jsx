import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const AdminDebug = () => {
    const { session, user, profile, isAdmin } = useAuth();
    const [results, setResults] = useState([]);

    useEffect(() => {
        runDiagnostics();
    }, []);

    const runDiagnostics = async () => {
        const tests = [];

        // Test 1: Auth State
        tests.push({
            name: 'Auth State',
            result: {
                hasSession: !!session,
                userId: user?.id || 'none',
                email: user?.email || 'none',
                profileRole: profile?.role || 'none',
                isAdmin: isAdmin,
            },
            status: 'info'
        });

        // Test 2: Session details
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            tests.push({
                name: 'Supabase Session',
                result: {
                    hasSession: !!currentSession,
                    accessToken: currentSession?.access_token ? currentSession.access_token.substring(0, 30) + '...' : 'none',
                    expiresAt: currentSession?.expires_at ? new Date(currentSession.expires_at * 1000).toLocaleString() : 'none',
                    isExpired: currentSession?.expires_at ? (currentSession.expires_at * 1000 < Date.now()) : 'no session',
                },
                status: currentSession ? 'ok' : 'warn'
            });
        } catch (e) {
            tests.push({ name: 'Supabase Session', result: e.message, status: 'error' });
        }

        // Test 3: Profiles SELECT
        try {
            const start = Date.now();
            const { data, error, count } = await supabase
                .from('profiles')
                .select('id, full_name, role', { count: 'exact' });
            const duration = Date.now() - start;
            tests.push({
                name: 'Profiles SELECT',
                result: {
                    count: count,
                    rowsReturned: data?.length || 0,
                    firstRow: data?.[0] || 'none',
                    error: error?.message || 'none',
                    durationMs: duration
                },
                status: error ? 'error' : data?.length > 0 ? 'ok' : 'warn'
            });
        } catch (e) {
            tests.push({ name: 'Profiles SELECT', result: e.message, status: 'error' });
        }

        // Test 4: Profiles COUNT (head: true)
        try {
            const start = Date.now();
            const { count, error } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            const duration = Date.now() - start;
            tests.push({
                name: 'Profiles COUNT',
                result: {
                    count: count,
                    error: error?.message || 'none',
                    durationMs: duration
                },
                status: error ? 'error' : count > 0 ? 'ok' : 'warn'
            });
        } catch (e) {
            tests.push({ name: 'Profiles COUNT', result: e.message, status: 'error' });
        }

        // Test 5: News SELECT
        try {
            const start = Date.now();
            const { data, error, count } = await supabase
                .from('news')
                .select('id, title', { count: 'exact' })
                .limit(3);
            const duration = Date.now() - start;
            tests.push({
                name: 'News SELECT',
                result: {
                    count: count,
                    rowsReturned: data?.length || 0,
                    firstTitle: data?.[0]?.title?.substring(0, 40) || 'none',
                    error: error?.message || 'none',
                    durationMs: duration
                },
                status: error ? 'error' : data?.length > 0 ? 'ok' : 'warn'
            });
        } catch (e) {
            tests.push({ name: 'News SELECT', result: e.message, status: 'error' });
        }

        // Test 6: News COUNT
        try {
            const start = Date.now();
            const { count, error } = await supabase
                .from('news')
                .select('*', { count: 'exact', head: true });
            const duration = Date.now() - start;
            tests.push({
                name: 'News COUNT',
                result: {
                    count: count,
                    error: error?.message || 'none',
                    durationMs: duration
                },
                status: error ? 'error' : count > 0 ? 'ok' : 'warn'
            });
        } catch (e) {
            tests.push({ name: 'News COUNT', result: e.message, status: 'error' });
        }

        // Test 7: Raw fetch (bypass Supabase client)
        try {
            const start = Date.now();
            const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=id,full_name,role&limit=3`;
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
            const resp = await fetch(url, {
                headers: {
                    'apikey': key,
                    'Authorization': `Bearer ${key}`,
                }
            });
            const data = await resp.json();
            const duration = Date.now() - start;
            tests.push({
                name: 'Raw Fetch (anon key)',
                result: {
                    status: resp.status,
                    rowsReturned: data?.length || 0,
                    data: data?.map(u => `${u.full_name} (${u.role})`).join(', ') || 'none',
                    durationMs: duration
                },
                status: resp.ok && data?.length > 0 ? 'ok' : 'error'
            });
        } catch (e) {
            tests.push({ name: 'Raw Fetch (anon key)', result: e.message, status: 'error' });
        }

        // Test 8: Raw fetch with user token
        try {
            const { data: { session: s } } = await supabase.auth.getSession();
            if (s?.access_token) {
                const start = Date.now();
                const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=id,full_name,role&limit=3`;
                const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
                const resp = await fetch(url, {
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${s.access_token}`,
                    }
                });
                const data = await resp.json();
                const duration = Date.now() - start;
                tests.push({
                    name: 'Raw Fetch (user JWT)',
                    result: {
                        status: resp.status,
                        rowsReturned: data?.length || 0,
                        data: Array.isArray(data) ? data?.map(u => `${u.full_name} (${u.role})`).join(', ') : JSON.stringify(data),
                        durationMs: duration
                    },
                    status: resp.ok && Array.isArray(data) && data.length > 0 ? 'ok' : 'error'
                });
            } else {
                tests.push({ name: 'Raw Fetch (user JWT)', result: 'No session/token', status: 'warn' });
            }
        } catch (e) {
            tests.push({ name: 'Raw Fetch (user JWT)', result: e.message, status: 'error' });
        }

        setResults(tests);
    };

    const statusColors = {
        ok: 'border-green-500/30 bg-green-500/5',
        warn: 'border-yellow-500/30 bg-yellow-500/5',
        error: 'border-red-500/30 bg-red-500/5',
        info: 'border-blue-500/30 bg-blue-500/5',
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
                    System <span className="text-red-600">Diagnostics</span>
                </h1>
                <p className="text-zinc-500 text-sm">Diagnostyka połączenia z Supabase - pokaż ten ekran developerowi</p>
            </div>

            <button onClick={runDiagnostics} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-500">
                🔄 Uruchom Ponownie
            </button>

            {results.length === 0 && (
                <div className="text-zinc-500 animate-pulse">Uruchamianie diagnostyki...</div>
            )}

            <div className="space-y-4">
                {results.map((test, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${statusColors[test.status]}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{test.status === 'ok' ? '✅' : test.status === 'warn' ? '⚠️' : test.status === 'error' ? '❌' : 'ℹ️'}</span>
                            <h3 className="text-white font-bold">{test.name}</h3>
                        </div>
                        <pre className="text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap bg-black/30 p-3 rounded-lg">
                            {JSON.stringify(test.result, null, 2)}
                        </pre>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDebug;

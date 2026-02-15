
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, User, Chrome, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const { login, signUp, loginSocial, sendMagicLink } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/members';

    const [authMethod, setAuthMethod] = useState('magic'); // 'magic', 'password', 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSocialLogin = async (provider) => {
        setError('');
        setSocialLoading(true);
        try {
            const result = await loginSocial(provider);
            // OAuth will redirect, but if there's an immediate error:
            if (result?.error) {
                throw result.error;
            }
        } catch (err) {
            console.error("Social Auth Error:", err);
            setError(`Nie udało się zalogować przez ${provider === 'google' ? 'Google' : 'Facebook'}. Spróbuj ponownie.`);
            setSocialLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (authMethod === 'magic') {
                await sendMagicLink(email);
                setSuccessMsg('Wysłaliśmy Magic Link na Twój email! Kliknij go, aby się zalogować.');
            } else if (authMethod === 'password') {
                await login(email, password);
                navigate(from, { replace: true });
            } else if (authMethod === 'signup') {
                await signUp(email, password, fullName);
                setSuccessMsg('Konto utworzone! Sprawdź email, aby potwierdzić rejestrację.');
                // Optionally switch to login or magic
            }
        } catch (err) {
            console.error("Auth failed:", err);
            let msg = 'Wystąpił błąd.';
            if (err.message.includes('Invalid login')) msg = 'Błędne dane logowania.';
            if (err.message.includes('rate limit')) msg = 'Za dużo prób. Odczekaj chwilę.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">
                        BOXING<span className="text-boxing-green">24</span>
                    </h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">
                        {authMethod === 'signup' ? 'Rejestracja' : 'Logowanie'}
                    </p>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-boxing-green/5 to-transparent pointer-events-none" />

                    <div className="relative z-10 space-y-6">

                        {/* Social Buttons */}
                        {authMethod !== 'signup' && (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleSocialLogin('google')}
                                    disabled={socialLoading || loading}
                                    className="flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {socialLoading ? (
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Chrome className="w-4 h-4" />
                                    )}
                                    Google
                                </button>
                                <button
                                    onClick={() => handleSocialLogin('facebook')}
                                    disabled={socialLoading || loading}
                                    className="flex items-center justify-center gap-2 bg-[#1877F2] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#166fe5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {socialLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Facebook className="w-4 h-4" />
                                    )}
                                    Facebook
                                </button>
                            </div>
                        )}

                        {/* Divider */}
                        {authMethod !== 'signup' && (
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-zinc-800"></div>
                                <span className="flex-shrink-0 mx-4 text-zinc-600 text-[10px] font-bold uppercase">lub kontynuuj emailem</span>
                                <div className="flex-grow border-t border-zinc-800"></div>
                            </div>
                        )}

                        {/* Error / Success Messages */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3 text-green-500 text-xs font-bold uppercase">
                                <AlertCircle className="w-4 h-4" /> {successMsg}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {authMethod === 'signup' && (
                                <div className="animate-in slide-in-from-top-2 fade-in space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Imię</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-[#111] border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-boxing-green/50 focus:ring-1 focus:ring-boxing-green/50 transition-all font-mono"
                                            placeholder="Twoje imię"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#111] border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-boxing-green/50 focus:ring-1 focus:ring-boxing-green/50 transition-all font-mono"
                                        placeholder="user@boxing24.pl"
                                        required
                                    />
                                </div>
                            </div>

                            {(authMethod === 'password' || authMethod === 'signup') && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Hasło</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#111] border border-zinc-800 text-white pl-12 pr-12 py-4 rounded-xl focus:outline-none focus:border-boxing-green/50 focus:ring-1 focus:ring-boxing-green/50 transition-all font-mono"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-boxing-green text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Przetwarzanie...' :
                                    authMethod === 'magic' ? 'Wyślij Magic Link' :
                                        authMethod === 'password' ? 'Zaloguj się Hasłem' : 'Zarejestruj się'
                                }
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>

                        {/* Toggles */}
                        <div className="flex flex-col items-center gap-3 mt-4 text-xs text-zinc-500">
                            {authMethod === 'magic' && (
                                <button onClick={() => setAuthMethod('password')} className="hover:text-white transition-colors underline decoration-zinc-700">
                                    Użyj tradycyjnego hasła
                                </button>
                            )}
                            {authMethod === 'password' && (
                                <button onClick={() => setAuthMethod('magic')} className="hover:text-white transition-colors underline decoration-zinc-700">
                                    Zaloguj się bez hasła (Magic Link)
                                </button>
                            )}

                            <div className="w-full border-t border-zinc-800/50 my-1"></div>

                            {authMethod === 'signup' ? (
                                <button onClick={() => setAuthMethod('magic')} className="hover:text-white transition-colors">
                                    Masz już konto? <span className="text-white font-bold">Zaloguj się</span>
                                </button>
                            ) : (
                                <button onClick={() => setAuthMethod('signup')} className="hover:text-white transition-colors">
                                    Nowy zawodnik? <span className="text-boxing-green font-bold">Załóż konto</span>
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;


import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, User } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const { login, signUp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/members';

    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); // Only for signup
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (isLoginMode) {
                await login(email, password);
                navigate(from, { replace: true });
            } else {
                await signUp(email, password, fullName);
                setSuccessMsg('Konto utworzone! Sprawdź email (jeśli wymagane) lub zaloguj się.');
                setIsLoginMode(true); // Switch back to login
            }
        } catch (err) {
            console.error("Auth failed:", err);
            setError(err.message === 'Invalid login credentials'
                ? 'Błędne dane logowania.'
                : 'Wystąpił błąd. Sprawdź poprawność danych.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">
                        BOXING<span className="text-boxing-green">24</span>
                    </h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">
                        {isLoginMode ? 'Panel Logowania' : 'Rejestracja Członka'}
                    </p>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-boxing-green/5 to-transparent pointer-events-none" />

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-wide">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3 text-green-500 text-xs font-bold uppercase tracking-wide">
                                <AlertCircle className="w-4 h-4" />
                                {successMsg}
                            </div>
                        )}

                        <div className="space-y-4">
                            {!isLoginMode && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Imię i Nazwisko</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-[#111] border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-boxing-green/50 focus:ring-1 focus:ring-boxing-green/50 transition-all font-mono"
                                            placeholder="Jan Kowalski"
                                            required={!isLoginMode}
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

                            <div className="space-y-2">
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
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-boxing-green transition-all flex items-center justify-center gap-2 group-invalid:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Przetwarzanie...' : (isLoginMode ? 'Zaloguj się' : 'Stwórz Konto')}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <button
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        className="text-zinc-600 text-xs hover:text-white transition-colors"
                    >
                        {isLoginMode ? (
                            <>Nie masz konta? <span className="font-bold border-b border-zinc-600 hover:border-white ml-1">Dołącz do Klubu</span></>
                        ) : (
                            <>Masz już konto? <span className="font-bold border-b border-zinc-600 hover:border-white ml-1">Zaloguj się</span></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

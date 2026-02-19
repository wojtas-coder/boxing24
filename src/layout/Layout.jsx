import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import AICoachWidget from '../components/AICoachWidget';
import PremiumSidebar from '../components/PremiumSidebar';

import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';

const AdminButton = () => {
    const { isAdmin, user, profile } = useAuth();
    console.log("Admin Check:", { email: user?.email, isAdmin, profile }); // DEBUG

    if (!isAdmin) return null;

    return (
        <Link to="/admin">
            <button className="ml-4 px-6 py-2 bg-zinc-900 border border-red-500/50 text-red-500 text-xs font-bold tracking-widest uppercase hover:bg-red-500 hover:text-white transition-all shadow-[0_0_10px_rgba(255,0,0,0.2)]">
                Panel Admina
            </button>
        </Link>
    );
};

const Layout = () => {
    const { user, logout } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Initialize Analytics
    useAnalytics();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Close mobile menu on route change
        setMobileMenuOpen(false);
        // Scroll to top
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-black font-sans text-gray-100 flex flex-col selection:bg-red-600 selection:text-white">

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 px-6 py-4 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/10' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
                <div className="max-w-[1920px] mx-auto flex items-center justify-between">

                    {/* LEFT: Logo */}
                    <div className="flex-shrink-0 w-[200px]">
                        <Link to="/" className="cursor-pointer group block w-fit">
                            <div className="w-32 md:w-36 transition-transform group-hover:scale-105">
                                <Logo />
                            </div>
                        </Link>
                    </div>

                    {/* CENTER: Navigation Links */}
                    <div className="hidden lg:flex items-center justify-center space-x-8 absolute left-1/2 -translate-x-1/2">
                        <Link
                            to="/news"
                            className="whitespace-nowrap text-[11px] xl:text-xs font-bold uppercase tracking-[0.2em] transition-all relative group text-red-500 hover:text-white"
                        >
                            Aktualności
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-current transition-all group-hover:w-full opacity-0 group-hover:opacity-100"></span>
                        </Link>

                        {/* DROPDOWN: KALENDARZ */}
                        <div className="relative group/dropdown py-2">
                            <Link to="/calendar" className="whitespace-nowrap text-[11px] xl:text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-1 text-zinc-400 group-hover/dropdown:text-white">
                                Kalendarz
                                <svg className="w-3 h-3 transition-transform group-hover/dropdown:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </Link>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 transform group-hover/dropdown:translate-y-0 translate-y-2">
                                <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 p-2 rounded shadow-[0_20px_40px_rgba(0,0,0,0.4)] min-w-[220px]">
                                    <Link
                                        to="/calendar?view=PRO"
                                        className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-yellow-500 hover:bg-white/5 rounded transition-all"
                                    >
                                        Boks Zawodowy
                                    </Link>
                                    <Link
                                        to="/calendar?view=AMATEUR"
                                        className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-blue-500 hover:bg-white/5 rounded transition-all"
                                    >
                                        Boks Olimpijski / Amatorski
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* DROPDOWN: OFERTA */}
                        <div className="relative group/dropdown py-2">
                            <Link to="/membership" className="whitespace-nowrap text-[11px] xl:text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-1 text-boxing-green group-hover/dropdown:text-white">
                                Oferta
                                <svg className="w-3 h-3 transition-transform group-hover/dropdown:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </Link>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 transform group-hover/dropdown:translate-y-0 translate-y-2">
                                <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 p-2 rounded shadow-[0_20px_40px_rgba(0,0,0,0.4)] min-w-[200px]">
                                    <Link
                                        to="/membership"
                                        className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500 hover:bg-white/5 rounded transition-all"
                                    >
                                        Online Premium
                                    </Link>
                                    <Link
                                        to="/booking"
                                        className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-all"
                                    >
                                        Treningi Personalne
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* DROPDOWN: WIEDZA */}
                        <div className="relative group/dropdown py-2">
                            <Link to="/knowledge" className="whitespace-nowrap text-[11px] xl:text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-1 text-zinc-400 group-hover/dropdown:text-white">
                                Wiedza
                                <svg className="w-3 h-3 transition-transform group-hover/dropdown:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </Link>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 transform group-hover/dropdown:translate-y-0 translate-y-2">
                                <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 p-2 rounded shadow-[0_20px_40px_rgba(0,0,0,0.4)] min-w-[180px]">
                                    <Link
                                        to="/knowledge?view=articles"
                                        className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-all"
                                    >
                                        Artykuły
                                    </Link>
                                    <Link
                                        to="/knowledge?view=compendium"
                                        className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-all"
                                    >
                                        Kompendium
                                    </Link>
                                    <Link
                                        to="/knowledge?view=reviews"
                                        className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-all"
                                    >
                                        Recenzje
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/boutique"
                            className="whitespace-nowrap text-[11px] xl:text-xs font-bold uppercase tracking-[0.2em] transition-all relative group text-zinc-400 hover:text-white"
                        >
                            Sklep PunchIn
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-current transition-all group-hover:w-full opacity-0 group-hover:opacity-100"></span>
                        </Link>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="hidden lg:flex items-center justify-end space-x-6 w-[200px]">

                        <AdminButton />

                        <Link to="/members">
                            <button className="px-6 py-2 border border-white/20 text-[10px] font-bold tracking-widest uppercase hover:bg-red-600 hover:border-red-600 hover:text-white transition-all rounded-sm">
                                {user ? 'Twój Panel' : 'Strefa Premium'}
                            </button>
                        </Link>

                        {user && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    const handleLogout = async () => {
                                        if (loggingOut) return;
                                        setLoggingOut(true);
                                        await logout();
                                    };
                                    handleLogout();
                                }}
                                className="text-zinc-500 hover:text-red-500 transition-colors disabled:opacity-50"
                                title="Wyloguj"
                                disabled={loggingOut}
                            >
                                {loggingOut ? (
                                    <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <LogOut className="w-4 h-4" />
                                )}
                            </button>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden text-white ml-auto"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <div className="w-8 h-0.5 bg-white mb-1.5"></div>
                        <div className="w-6 h-0.5 bg-white mb-1.5 ml-auto"></div>
                        <div className="w-8 h-0.5 bg-white"></div>
                    </button>
                </div>
            </nav >

            {/* Mobile Menu Overlay */}
            < AnimatePresence >
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col space-y-6 text-center">
                            <Link to="/news" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-red-500">Aktualności</Link>

                            <div className="flex flex-col space-y-4">
                                <Link to="/calendar" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-white">Kalendarz</Link>
                                <Link to="/calendar?view=PRO" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-zinc-400 hover:text-yellow-500 transition-colors">→ Boks Zawodowy</Link>
                                <Link to="/calendar?view=AMATEUR" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-zinc-400 hover:text-blue-500 transition-colors">→ Boks Olimpijski</Link>
                            </div>

                            <div className="flex flex-col space-y-4">
                                <Link to="/membership" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-red-500">Oferta</Link>
                                <Link to="/membership" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">→ Online Premium</Link>
                                <Link to="/booking" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">→ Treningi Personalne</Link>
                            </div>

                            <div className="flex flex-col space-y-4">
                                <Link to="/knowledge" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-white">Wiedza</Link>
                                <Link to="/knowledge?view=articles" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">→ Artykuły</Link>
                                <Link to="/knowledge?view=compendium" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">→ Kompendium</Link>
                                <Link to="/knowledge?view=reviews" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">→ Recenzje</Link>
                            </div>

                            <Link to="/boutique" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-white">Sklep PunchIn</Link>
                            <Link to="/members" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-red-500">Strefa Premium</Link>
                            {user && (
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        logout().then(() => window.location.href = '/login');
                                    }}
                                    className="text-lg font-bold uppercase tracking-widest text-red-500 mt-4"
                                >
                                    Wyloguj się
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >

            {/* Page Content - Animations Removed for Debugging */}
            <main className="flex-grow pt-0">
                <Outlet />
            </main>

            <AICoachWidget /> {/* Added AICoachWidget here */}
            <PremiumSidebar />
            <Footer />
        </div>
    );
};

export default Layout;

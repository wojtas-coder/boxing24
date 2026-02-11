import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import AICoachWidget from '../components/AICoachWidget';

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
        <div className="min-h-screen bg-black font-sans text-gray-100 flex flex-col selection:bg-boxing-green selection:text-white">

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
                        {[
                            { to: '/news', label: 'Aktualności', color: 'text-red-500' },
                            { to: '/calendar', label: 'Kalendarz', color: 'text-zinc-300' },
                            { to: '/membership', label: 'Oferta Online', color: 'text-boxing-green' },
                            { to: '/booking', label: 'Treningi Personalne', color: 'text-zinc-300' },
                            { to: '/knowledge', label: 'Wiedza', color: 'text-zinc-300' },
                            { to: '/boutique', label: 'Sklep', color: 'text-zinc-300' }
                        ].map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`whitespace-nowrap text-[11px] xl:text-xs font-bold uppercase tracking-[0.2em] transition-all relative group ${link.color === 'text-boxing-green' ? 'text-boxing-green hover:text-white' : link.color === 'text-red-500' ? 'text-red-500 hover:text-white' : 'text-zinc-400 hover:text-white'}`}
                            >
                                {link.label}
                                <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-current transition-all group-hover:w-full opacity-0 group-hover:opacity-100`}></span>
                            </Link>
                        ))}
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="hidden lg:flex items-center justify-end space-x-6 w-[200px]">

                        <AdminButton />

                        <Link to="/members">
                            <button className="px-6 py-2 border border-white/20 text-[10px] font-bold tracking-widest uppercase hover:bg-boxing-green hover:border-boxing-green hover:text-black transition-all rounded-sm">
                                {user ? 'Twój Panel' : 'Strefa Klienta'}
                            </button>
                        </Link>

                        {user && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    logout();
                                    setTimeout(() => window.location.href = '/', 100);
                                }}
                                className="text-zinc-500 hover:text-red-500 transition-colors"
                                title="Wyloguj"
                            >
                                <LogOut className="w-4 h-4" />
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
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col space-y-6 text-center">
                            <Link to="/news" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-red-500">Aktualności</Link>
                            <Link to="/membership" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-[#22c55e]">Oferta Online</Link>
                            <Link to="/calendar" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-white">Kalendarz</Link>
                            <Link to="/booking" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-white">Treningi Personalne</Link>
                            <Link to="/knowledge" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-white">Wiedza</Link>
                            <Link to="/boutique" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-white">Sklep Premium</Link>
                            <Link to="/members" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest text-[#22c55e]">Strefa Klienta</Link>
                            {user && (
                                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-lg font-bold uppercase tracking-widest text-red-500 mt-4">
                                    Wyloguj się
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Page Content - Animations Removed for Debugging */}
            <main className="flex-grow pt-0">
                <Outlet />
            </main>

            <AICoachWidget /> {/* Added AICoachWidget here */}
            <Footer />
        </div>
    );
};

export default Layout;

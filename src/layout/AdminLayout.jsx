import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Newspaper, Users, LogOut, Menu, X,
    Shield, BarChart3, Megaphone, Settings, BookOpen,
    Image as ImageIcon, Send, Calendar, CalendarDays, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

// Dashboard Version: 3.1 - Newsletter Fix
const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Pulpit', path: '/admin' },
        { icon: BarChart3, label: 'Analityka', path: '/admin/stats' },
        { icon: ShoppingBag, label: 'Sklep', path: '/admin/boutique' },
        { icon: Calendar, label: 'Rezerwacje', path: '/admin/bookings' },
        { icon: CalendarDays, label: 'Kalendarz', path: '/admin/calendar' },
        { icon: Newspaper, label: 'Newsroom', path: '/admin/news' },
        { icon: BookOpen, label: 'Wiedza', path: '/admin/knowledge' },
        { icon: ImageIcon, label: 'Galeria', path: '/admin/media' },
        { icon: Users, label: 'Użytkownicy', path: '/admin/users' },
        { icon: Send, label: 'Newsletter', path: '/admin/email' },
        { icon: Megaphone, label: 'Kampanie', path: '/admin/ads' },
        { icon: Settings, label: 'SEO & Config', path: '/admin/seo' },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden selection:bg-red-600 selection:text-white">

            {/* SIDEBAR - Desktop */}
            <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-zinc-900/50 backdrop-blur-xl h-screen fixed left-0 top-0 z-50">
                <div className="p-8 border-b border-white/5">
                    <div className="w-32 opacity-80 hover:opacity-100 transition-opacity">
                        <Logo />
                    </div>
                    <div className="mt-4 flex flex-col">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.3em]">Command Center</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
                                    ${isActive
                                        ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`} />
                                <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all font-bold uppercase text-xs tracking-widest"
                    >
                        <LogOut className="w-5 h-5" />
                        Wyloguj
                    </button>
                </div>
            </aside>

            {/* MOBILE HEADER */}
            <div className="md:hidden fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
                <div className="w-24"><Logo /></div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* MOBILE MENU OVERLAY */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-zinc-900 md:hidden pt-24 px-6 space-y-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-4 p-4 text-white text-lg font-bold uppercase tracking-widest border-b border-white/5"
                        >
                            <item.icon className="w-6 h-6" />
                            {item.label}
                        </Link>
                    ))}
                    <button onClick={logout} className="flex items-center gap-4 p-4 text-red-500 text-lg font-bold uppercase tracking-widest w-full text-left">
                        <LogOut className="w-6 h-6" /> Wyloguj
                    </button>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 md:ml-64 p-6 md:p-12 pt-24 md:pt-12 min-h-screen overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;

import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, LogOut, Menu, X, Dumbbell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const CoachLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Pulpit Trenera', path: '/coach' },
        { icon: Users, label: 'Moi Zawodnicy', path: '/coach/clients' },
        { icon: MessageSquare, label: 'Wiadomości', path: '/coach/chat' },
        { icon: Dumbbell, label: 'Kreator Planów', path: '/coach/plans' },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden selection:bg-blue-600 selection:text-white">

            {/* SIDEBAR - Desktop (Blue Accent for Coach) */}
            <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-zinc-900/50 backdrop-blur-xl h-screen fixed left-0 top-0 z-50">
                <div className="p-8 border-b border-white/5">
                    <div className="w-32 opacity-80 hover:opacity-100 transition-opacity">
                        <Logo />
                    </div>
                    <div className="mt-4 text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">Coach System</div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/coach' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
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

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 md:ml-64 p-6 md:p-12 pt-24 md:pt-12 min-h-screen overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black">
                <Outlet />
            </main>
        </div>
    );
};

export default CoachLayout;

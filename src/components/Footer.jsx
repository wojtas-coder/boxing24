import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Instagram, Youtube, Phone } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: 'Newsy', to: '/news' },
        { label: 'Kalendarz', to: '/calendar' },
        { label: 'Rezerwacja', to: '/booking' },
        { label: 'Wiedza', to: '/knowledge' },
        { label: 'Członkostwo', to: '/membership' },
        { label: 'Sklep', to: '/boutique' },
    ];

    return (
        <footer className="bg-black border-t border-zinc-900">
            {/* Main Footer */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Logo className="scale-75 origin-left" />
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                            Biomechanika spotyka technologię. Kompletny ekosystem treningowy dla ambitnych bokserów.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://www.instagram.com/boxing24.pl/" target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white hover:border-red-500/30 transition-all">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="https://www.youtube.com/@Boxing24_pl" target="_blank" rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white hover:border-red-500/30 transition-all">
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div>
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Nawigacja</h4>
                        <ul className="space-y-3">
                            {quickLinks.map(link => (
                                <li key={link.to}>
                                    <Link to={link.to} className="text-zinc-400 text-sm hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Kontakt</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-zinc-400 text-sm">
                                <MapPin className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                <span>Wrocław, Polska</span>
                            </li>
                            <li>
                                <a href="mailto:kontakt@boxing24.pl" className="flex items-center gap-3 text-zinc-400 text-sm hover:text-white transition-colors">
                                    <Mail className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                    <span>kontakt@boxing24.pl</span>
                                </a>
                            </li>
                        </ul>

                        {/* CTA */}
                        <Link to="/booking" className="mt-8 block">
                            <div className="bg-red-600/10 border border-red-500/20 p-4 rounded-xl hover:bg-red-600/20 transition-all group">
                                <p className="text-red-400 text-xs font-bold uppercase tracking-widest group-hover:text-red-300">
                                    Umów Darmowy Trening Próbny →
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-zinc-900/50 py-6">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-600 text-xs">
                        © {currentYear} Boxing24. Portal z pasji do boksu. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-zinc-600 text-xs">
                        <Link to="/privacy" className="hover:text-zinc-400 transition-colors">Polityka Prywatności</Link>
                        <Link to="/terms" className="hover:text-zinc-400 transition-colors">Regulamin</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

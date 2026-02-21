import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Instagram, Youtube, Phone, Facebook } from 'lucide-react';
import Logo from './Logo';
import NewsletterBox from './common/NewsletterBox';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
    const { settings } = useSettings();
    const currentYear = new Date().getFullYear();

    const quickLinks = settings?.footer_menu?.quick_links || [];
    const bottomLinks = settings?.footer_menu?.bottom_links || [
        { id: "b1", label: "Polityka Prywatności", path: "/privacy" },
        { id: "b2", "label": "Regulamin", path: "/terms" }
    ];

    return (
        <footer className="bg-black border-t border-zinc-900">
            {/* Main Footer */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Logo className="scale-75 origin-left" />
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                            Biomechanika spotyka technologię. Kompletny ekosystem treningowy dla ambitnych bokserów.
                        </p>
                        <div className="flex items-center gap-4">
                            {settings.social_instagram && (
                                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white hover:border-red-500/30 transition-all">
                                    <Instagram className="w-4 h-4" />
                                </a>
                            )}
                            {settings.social_facebook && (
                                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white hover:border-red-500/30 transition-all">
                                    <Facebook className="w-4 h-4" />
                                </a>
                            )}
                            {settings.social_youtube && (
                                <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white hover:border-red-500/30 transition-all">
                                    <Youtube className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div>
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Nawigacja</h4>
                        <ul className="space-y-3">
                            {quickLinks.map(link => (
                                <li key={link.id}>
                                    <Link to={link.path} className="text-zinc-400 text-sm hover:text-white transition-colors">
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
                            {settings.address_city && (
                                <li className="flex items-center gap-3 text-zinc-400 text-sm">
                                    <MapPin className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                    <span>{settings.address_city}{settings.address_street ? `, ${settings.address_street}` : ''}</span>
                                </li>
                            )}
                            {settings.contact_email && (
                                <li>
                                    <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-3 text-zinc-400 text-sm hover:text-white transition-colors">
                                        <Mail className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                        <span>{settings.contact_email}</span>
                                    </a>
                                </li>
                            )}
                            {settings.contact_phone && (
                                <li>
                                    <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-3 text-zinc-400 text-sm hover:text-white transition-colors">
                                        <Phone className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                        <span>{settings.contact_phone}</span>
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <NewsletterBox variant="footer" />
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-zinc-900/50 py-6">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-600 text-xs">
                        © {currentYear} {settings.company_name || 'Boxing24'}. Wszystkie prawa zastrzeżone.
                    </p>
                    <div className="flex gap-6 text-zinc-600 text-xs">
                        {bottomLinks.map(link => (
                            <Link key={link.id} to={link.path} className="hover:text-zinc-400 transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

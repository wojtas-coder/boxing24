import React from 'react';
import Logo from './Logo';

const Footer = () => {
    return (
        <footer className="py-12 bg-black border-t border-zinc-900">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                <Logo className="scale-75 origin-left" />

                <div className="text-gray-500 text-sm text-center md:text-right">
                    <p>Wrocław, Polska</p>
                    <p>kontakt@boxing24.pl</p>
                    <p className="mt-4 opacity-50">&copy; 2024 Boxing24. Portal z pasji do boksu. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

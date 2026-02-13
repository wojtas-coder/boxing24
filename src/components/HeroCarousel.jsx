import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import banners
import studioBanner from '../assets/banners/banner-studio.png';
import onlineBanner from '../assets/banners/banner-online.png';
import shopBanner from '../assets/banners/banner-shop.png';
import knowledgeBanner from '../assets/banners/banner-knowledge.png';

const slides = [
    {
        id: 1,
        title: "TRENINGI STACJONARNE",
        subtitle: "Wrocław / Cała Polska",
        description: "Zapomnij o fitness-boksie. Trenuj jak zawodowiec w naszym studio. Technika, sparringi, przygotowanie motoryczne.",
        image: studioBanner,
        link: "/booking",
        cta: "Zarezerwuj Trening",
        color: "text-boxing-green"
    },
    {
        id: 2,
        title: "B24 ONLINE",
        subtitle: "Aplikacja & Mentoring",
        description: "Twój kieszonkowy trener. Plany treningowe, analiza wideo, dieta i suplementacja. Trenuj gdziekolwiek jesteś.",
        image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1974&auto=format&fit=crop",
        link: "/membership",
        cta: "Dołącz do Programu",
        color: "text-blue-500"
    },
    {
        id: 3,
        title: "BUTIK PUNCHIN'™",
        subtitle: "Sprzęt Premium",
        description: "Tylko sprawdzony sprzęt. Kolekcja PunchIn' - worki, tarcze, odzież. Jakość, która przetrwa każdą rundę.",
        image: shopBanner,
        link: "/boutique",
        cta: "Przejdź do Sklepu",
        color: "text-purple-500"
    },
    {
        id: 4,
        title: "BOKSOPEDIA",
        subtitle: "Wiedza & Nauka",
        description: "Encyklopedia fight-science. Artykuły o taktyce, psychologii i biomechanice ciosu. Czytaj i wygrywaj.",
        image: knowledgeBanner,
        link: "/knowledge",
        cta: "Czytaj Artykuły",
        color: "text-yellow-500"
    }
];

const HeroCarousel = () => {
    const [current, setCurrent] = useState(0);
    const length = slides.length;

    const nextSlide = () => {
        setCurrent(current === length - 1 ? 0 : current + 1);
    };

    const prevSlide = () => {
        setCurrent(current === 0 ? length - 1 : current - 1);
    };

    // Auto-scroll
    useEffect(() => {
        const timer = setTimeout(() => {
            nextSlide();
        }, 6000);
        return () => clearTimeout(timer);
    }, [current]);

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black">
            <AnimatePresence mode='wait'>
                {slides.map((slide, index) => (
                    index === current && (
                        <motion.div
                            key={slide.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 w-full h-full"
                        >
                            {/* Background Image with Zoom Effect */}
                            <motion.div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${slide.image})` }}
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 6, ease: "linear" }}
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />

                            {/* Content */}
                            <div className="absolute inset-0 flex items-center px-4 md:px-20">
                                <div className="max-w-3xl pt-20">
                                    <motion.span
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className={`text-sm md:text-base font-bold tracking-[0.3em] uppercase ${slide.color} mb-4 block`}
                                    >
                                        {slide.subtitle}
                                    </motion.span>

                                    <motion.h1
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter mb-6 leading-none shadow-black drop-shadow-lg"
                                    >
                                        {slide.title}
                                    </motion.h1>

                                    <motion.p
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-lg md:text-xl text-gray-300 max-w-xl mb-10 leading-relaxed font-light drop-shadow-md"
                                    >
                                        {slide.description}
                                    </motion.p>

                                    <motion.div
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <Link
                                            to={slide.link}
                                            className="group inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-boxing-green hover:border-boxing-green transition-all duration-300"
                                        >
                                            {slide.cta}
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )
                ))}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute bottom-10 right-10 flex gap-4 z-20">
                <button onClick={prevSlide} className="p-3 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={nextSlide} className="p-3 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 transition-colors">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Pagination Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`h-1 cursor-pointer transition-all duration-300 ${current === idx ? 'w-12 bg-boxing-green' : 'w-6 bg-white/30 hover:bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;

import React from 'react';
import Layout from '../layout/Layout';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingCard = ({ title, price, features, tier, recommended, onClick, buttonText }) => {
    return (
        <div className={`relative p-8 rounded-3xl border flex flex-col h-full bg-[#0a0a0a] transition-all duration-300 hover:-translate-y-2
            ${recommended
                ? 'border-boxing-green shadow-[0_0_50px_rgba(0,255,0,0.15)] z-10 scale-105'
                : 'border-white/10 hover:border-white/30 text-gray-400'}
        `}>
            {recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-boxing-green text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    Najczęściej Wybierany
                </div>
            )}

            <div className="mb-8">
                <h3 className={`text-sm font-bold uppercase tracking-[0.2em] mb-4 ${recommended ? 'text-boxing-green' : 'text-gray-500'}`}>{title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-black text-white">{price}</span>
                    <span className="text-sm font-bold text-gray-500">PLN</span>
                </div>
                {tier !== 'elite' && <div className="text-xs text-gray-600 font-mono mt-2 uppercase">Miesięcznie</div>}
                {tier === 'elite' && <div className="text-xs text-gray-600 font-mono mt-2 uppercase">Miejsca limitowane</div>}
            </div>

            <div className="space-y-4 mb-12 flex-grow">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-1 ${recommended ? 'bg-boxing-green text-black' : 'bg-zinc-800 text-gray-400'}`}>
                            <Check className="w-3 h-3" />
                        </div>
                        <span className={`text-sm font-medium ${recommended ? 'text-gray-200' : 'text-gray-500'}`}>{feature}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={onClick}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all
                    ${recommended
                        ? 'bg-boxing-green text-black hover:bg-white hover:scale-105'
                        : 'bg-zinc-900 text-white hover:bg-zinc-800 border border-white/5'}
                `}
            >
                {buttonText || "Wybierz Pakiet"}
            </button>
        </div>
    );
};

const MembershipPage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#050505] min-h-screen pt-24 md:pt-32 pb-20 px-4">

            {/* HEADLINE */}
            <div className="text-center max-w-3xl mx-auto mb-20">
                <span className="text-boxing-green font-bold text-xs uppercase tracking-[0.3em] mb-4 block animate-pulse">Dołącz do Drużyny</span>
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase mb-6">
                    Zainwestuj w <br /><span className="text-boxing-green">Swoją Formę</span>
                </h1>
                <p className="text-gray-400 text-lg font-light leading-relaxed">
                    Niezależnie od tego, czy szukasz wiedzy, planu treningowego czy pełnej opieki mentorskiej – mamy rozwiązanie skrojone pod Twoje ambicje.
                </p>
            </div>

            {/* PRICING GRID */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">

                {/* TIER 1: SCOUT */}
                <PricingCard
                    title="Digital Pass"
                    price="9.99"
                    tier="basic"
                    onClick={() => alert("Przekierowanie do płatności subskrypcyjnej...")}
                    features={[
                        "Pełen dostęp do Boksopedii (Artykuły Premium)",
                        "Nielimitowany dostęp do bazy wiedzy",
                        "Dostęp do Społeczności Discord",
                        "Newsletter Taktyczny"
                    ]}
                />

                {/* TIER 2: FIGHTER (RECOMMENDED) */}
                <PricingCard
                    title="Pro Fighter"
                    price="249"
                    tier="pro"
                    recommended={true}
                    buttonText="Rozpocznij Współpracę"
                    onClick={() => navigate('/members')}
                    features={[
                        "Wszystko z pakietu Digital Pass",
                        "Dostęp do Panelu Zawodnika (Member Zone)",
                        "Plan Treningowy (Boks / Motoryka / Hybryda)",
                        "Dziennik Treningowy Online",
                        "1x Konsultacja Wideo (Analiza Techniki) / mc"
                    ]}
                />

                {/* TIER 3: ELITE */}
                <PricingCard
                    title="Elite Mentorship"
                    price="1499"
                    tier="elite"
                    buttonText="Aplikuj o Miejsce"
                    onClick={() => window.location.href = 'mailto:kontakt@boxing24.pl?subject=High%20Ticket%20Mentorship'}
                    features={[
                        "Pełna opieka trenerska 24/7",
                        "Indywidualny makrocykl treningowy",
                        "Cotygodniowa Analiza Wideo Twoich walk/spparingów",
                        "Konsultacje dietetyczne i suplementacyjne",
                        "Ebooki i Poradniki Premium w cenie",
                        "Priorytetowy kontakt na WhatsApp",
                        "Spotkania na żywo (opcjonalnie)"
                    ]}
                />

            </div>

            {/* FAQ SECTION */}
            <div className="max-w-3xl mx-auto mt-20 md:mt-32 space-y-12 border-t border-white/5 pt-20">
                <h2 className="text-2xl font-black text-white uppercase text-center mb-12">Częste Pytania</h2>

                {[
                    { q: "Czy mogę zrezygnować w dowolnym momencie?", a: "Tak, subskrypcja Digital Pass i Pro Fighter jest miesięczna. Możesz anulować w każdej chwili." },
                    { q: "Jak wygląda analiza wideo?", a: "W pakiecie Pro i Elite wysyłasz nam nagranie (do 15 min), a my odsyłamy Ci materiał z narysowanymi korektami i komentarzem głosowym." },
                    { q: "Czy plany są personalizowane?", a: "W pakiecie Pro otrzymujesz dostęp do naszych sprawdzonych szablonów, które dobieramy pod Twoją ankietę. W pakiecie Elite plan jest pisany od zera pod Ciebie." }
                ].map((faq, i) => (
                    <div key={i} className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/5">
                        <h3 className="text-white font-bold text-lg mb-2">{faq.q}</h3>
                        <p className="text-gray-500 text-sm">{faq.a}</p>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default MembershipPage;

import React, { useState } from 'react';
import { Check, Dumbbell, Clock, Target, Shield, Shirt, Droplet, Zap, Heart, Users, Award, Bath } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingCard = ({ title, price, features, tier, recommended, onClick, buttonText }) => {
    return (
        <div className={`relative p-8 rounded-3xl border flex flex-col h-full bg-[#0a0a0a] transition-all duration-300 hover:-translate-y-2
            ${recommended
                ? 'border-boxing-green shadow-[0_0_50px_rgba(34,197,94,0.15)] z-10 scale-105'
                : 'border-white/10 hover:border-white/30 text-gray-400'}
        `}>
            {recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-boxing-green text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
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
                        <div className={`mt-0.5 rounded-full p-1 ${recommended ? 'bg-boxing-green text-white' : 'bg-zinc-800 text-gray-400'}`}>
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
                        ? 'bg-boxing-green text-white hover:bg-boxing-green hover:scale-105'
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
    const [activeView, setActiveView] = useState('online'); // 'online' or 'personalne'

    return (
        <div className="bg-[#050505] min-h-screen pt-24 md:pt-32 pb-20 px-4">

            {/* HEADLINE */}
            <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-boxing-green font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Dołącz do Drużyny</span>
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase mb-6">
                    Zainwestuj w <br /><span className="text-boxing-green">Swoją Formę</span>
                </h1>
                <p className="text-gray-400 text-lg font-light leading-relaxed">
                    Niezależnie od tego, czy szukasz wiedzy, planu treningowego czy pełnej opieki mentorskiej – mamy rozwiązanie skrojone pod Twoje ambicje.
                </p>
            </div>

            {/* PILL TOGGLE */}
            <div className="flex justify-center mb-16">
                <div className="inline-flex bg-zinc-900/50 border border-white/10 rounded-full p-1">
                    <button
                        onClick={() => setActiveView('online')}
                        className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeView === 'online'
                            ? 'bg-boxing-green text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                            : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        Pakiety Online
                    </button>
                    <button
                        onClick={() => setActiveView('personalne')}
                        className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeView === 'personalne'
                            ? 'bg-boxing-green text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                            : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        Treningi Personalne
                    </button>
                </div>
            </div>

            {/* ONLINE VIEW */}
            {activeView === 'online' && (
                <div className="max-w-7xl mx-auto">
                    {/* PRICING GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">

                        {/* TIER 1: SCOUT */}
                        <PricingCard
                            title="Digital Pass"
                            price="19.99"
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
                                "Cotygodniowa Analiza Wideo Twoich walk/sparingów",
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
            )}

            {/* PERSONALNE VIEW */}
            {activeView === 'personalne' && (
                <div className="max-w-6xl mx-auto space-y-24">

                    {/* BENEFITS SECTION */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase text-center mb-12">
                            Zalety Treningów <span className="text-boxing-green">Personalnych</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                {
                                    icon: <Target className="w-8 h-8" />,
                                    title: "Profesjonalne podejście",
                                    desc: "Certyfikowani trenerzy z wieloletnim doświadczeniem w pracy z zawodnikami różnego poziomu."
                                },
                                {
                                    icon: <Clock className="w-8 h-8" />,
                                    title: "Elastyczny grafik",
                                    desc: "Trenuj wtedy, kiedy Ci to pasuje. Dopasujemy się do Twojego harmonogramu."
                                },
                                {
                                    icon: <Dumbbell className="w-8 h-8" />,
                                    title: "Dostosowane ćwiczenia",
                                    desc: "Plan treningowy szyte na miarę — od absolutnych podstaw po zaawansowane techniki."
                                },
                                {
                                    icon: <Shield className="w-8 h-8" />,
                                    title: "Bezpieczne środowisko",
                                    desc: "Pełna kontrola trenera, zapobieganie kontuzjom, progresja pod okiem specjalisty."
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-zinc-900/50 border border-white/10 p-8 rounded-2xl hover:border-boxing-green/30 transition-all group">
                                    <div className="text-boxing-green mb-4 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-white font-bold text-lg uppercase mb-2">{item.title}</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* WHAT TO BRING SECTION */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase text-center mb-4">
                            Co zabrać na <span className="text-boxing-green">pierwszy trening?</span>
                        </h2>
                        <p className="text-zinc-500 text-center mb-12 max-w-2xl mx-auto">
                            Nie musisz mieć żadnego doświadczenia ani sprzętu — ale te rzeczy ułatwią Ci start.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {[
                                { icon: <Bath className="w-6 h-6" />, label: "Ręcznik", desc: "Podstawa higieny" },
                                { icon: <Shirt className="w-6 h-6" />, label: "Strój sportowy", desc: "Wygodne ubranie" },
                                { icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17h16M4 17l2-6h12l2 6M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" /><path d="M8 17v2M12 17v2M16 17v2" /></svg>, label: "Obuwie", desc: "Czyste buty halowe" },
                                { icon: <Droplet className="w-6 h-6" />, label: "Woda", desc: "Nawodnienie to podstawa" },
                                { icon: <Target className="w-6 h-6" />, label: "Cel", desc: "Twoja motywacja" },
                                { icon: <Zap className="w-6 h-6" />, label: "Energia", desc: "Pozytywne nastawienie" }
                            ].map((item, i) => (
                                <div key={i} className="bg-black border border-white/5 p-6 rounded-xl text-center hover:bg-zinc-900/50 transition-all">
                                    <div className="text-boxing-green mb-3 flex justify-center">
                                        {item.icon}
                                    </div>
                                    <h4 className="text-white font-bold text-sm uppercase mb-1">{item.label}</h4>
                                    <p className="text-zinc-600 text-xs">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* WHY BOXING SECTION */}
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase text-center mb-12">
                            To jest sport <span className="text-boxing-green">dla mnie!</span>
                        </h2>
                        <div className="space-y-8">
                            <div className="bg-zinc-900/30 border-l-4 border-boxing-green p-6 rounded-r-2xl">
                                <div className="flex items-start gap-4">
                                    <Users className="w-6 h-6 text-boxing-green flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-2">Odreagowanie stresu</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            Ciężki dzień w pracy? Boks to najlepszy sposób na rozładowanie napięcia. Fizyczna aktywność połączona z koncentracją pozwala ,,wyłączyć myślenie" i odciąć się od problemów.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-900/30 border-l-4 border-boxing-green p-6 rounded-r-2xl">
                                <div className="flex items-start gap-4">
                                    <Dumbbell className="w-6 h-6 text-boxing-green flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-2">Kompleksowy trening całego ciała</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            Boks angażuje każdą partię mięśniową — od nóg, przez core, aż po ramiona. To nie tylko cardio, ale także siła, koordynacja i gibkość w jednym pakiecie.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-900/30 border-l-4 border-boxing-green p-6 rounded-r-2xl">
                                <div className="flex items-start gap-4">
                                    <Award className="w-6 h-6 text-boxing-green flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-2">Pewność siebie i umiejętności samoobrony</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            Wiedza, że potrafisz się obronić, daje niesamowitą pewność siebie w codziennym życiu. Nie chodzi o szukanie konfliktów, ale o spokój wynikający z kompetencji.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA SECTION */}
                    <div className="bg-gradient-to-br from-boxing-green/10 via-zinc-900/50 to-black border border-boxing-green/20 rounded-3xl p-12 text-center">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase mb-4">
                            Gotowy na <span className="text-boxing-green">pierwszy trening</span>?
                        </h2>
                        <p className="text-zinc-400 text-lg mb-2">Underground Boxing Club • Wrocław</p>
                        <p className="text-boxing-green text-2xl font-bold mb-8">Od 150 PLN / sesja</p>
                        <button
                            onClick={() => navigate('/booking')}
                            className="px-12 py-5 bg-boxing-green text-white text-sm font-black uppercase tracking-widest rounded-full hover:bg-boxing-green hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                        >
                            Umów Pierwszy Trening
                        </button>
                        <p className="text-zinc-600 text-xs mt-6">
                            Lub napisz do nas: <a href="mailto:kontakt@boxing24.pl" className="text-boxing-green hover:text-boxing-green">kontakt@boxing24.pl</a>
                        </p>
                    </div>

                </div>
            )}

        </div>
    );
};

export default MembershipPage;


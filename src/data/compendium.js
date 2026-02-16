export const compendium = [
    {
        id: 'lvl_1',
        title: 'Poziom 1: Fundamenty Biomechaniczne',
        subtitle: 'Licencjat: Architektura Ruchu',
        description: 'Boks to nie bicie. To zarządzanie środkiem ciężkości i transfer energii kinetycznej. Na tym poziomie budujemy szkielet, na którym oprze się cała Twoja kariera.',
        modules: [
            {
                id: 'm1_stance',
                title: 'Moduł 1.1: Architektura Postawy (The Stance)',
                lessons: [
                    {
                        id: 'l1_base',
                        title: 'Dystrybucja Masy i Środek Ciężkości (CoG)',
                        duration: 15,
                        content: `
                            <h3>Fizyka Stabilności</h3>
                            <p>Postawa bokserska to kompromis między stabilnością a mobilnością. W ujęciu fizyki, dążymy do obniżenia środka ciężkości (Center of Gravity - CoG) przy jednoczesnym zachowaniu wektorów siły skierowanych ku przeciwnikowi.</p>
                            <h4>Złota Proporcja 55/45</h4>
                            <p>Dla boksera ofensywnego (Pressure Fighter), dystrybucja masy powinna wynosić 55% na nodze przedniej i 45% na tylnej. To pozwala na skrócenie czasu reakcji przy inicjacji ataku o 0.2s w porównaniu do rozkładu 50/50.</p>
                            <h4>Kąt Ustawienia Stóp</h4>
                            <p>Stopa przednia: 10-15 stopni do wewnątrz. Stopa tylna: 45-60 stopni. To ustawienie blokuje staw kolanowy przed przeprostem i umożliwia "wkręcenie" biodra (Hip Rotation Torque) bez utraty przyczepności (tarcie statyczne).</p>
                        `
                    },
                    {
                        id: 'l2_guard',
                        title: 'Wysoka Garda a Pole Widzenia (Peripheral Vision)',
                        content: `
                            <h3>Paradygmat Ochrony Mózgu</h3>
                            <p>Ludzkie oko ma pole widzenia około 120 stopni binokularnie. Wysoka garda ogranicza je do 90. Dlatego kluczowe jest nie tyle trzymanie rąk wysoko, co aktywne skanowanie przestrzeni.</p>
                            <h4>Pozycja Łokci (Elbow Tucking)</h4>
                            <p>Łokcie muszą chronić wątrobę i śledzionę. W biomechanice nazywamy to "zamkniętym łańcuchem kinetycznym" tułowia. Otwarcie łokcia o 5cm zwiększa ryzyko nokautu o 40% przy ciosach na korpus.</p>
                        `
                    }
                ]
            },
            {
                id: 'm2_footwork',
                title: 'Moduł 1.2: Lokomocja i Wektory Ruchu',
                lessons: [
                    {
                        id: 'l3_step',
                        title: 'Krok Podstawowy (Push-Step Mechanism)',
                        content: `
                            <h3>Analiza Chodu Bokserskiego</h3>
                            <p>Boks nie polega na chodzeniu, ale na "ślizganiu" (gliding). Ruch inicjowany jest przez plyometryczne odbicie nogi przeciwnej do kierunku ruchu.</p>
                            <h4>Ground Reaction Force (GRF)</h4>
                            <p>Siła, z jaką odpychasz ziemię, determinuje szybkość skracania dystansu. Najlepsi zawodnicy (Lomachenko, Rigondeaux) generują GRF równe 2.5x masy ciała przy każdym kroku.</p>
                        `
                    }
                ]
            }
        ]
    },
    {
        id: 'lvl_2',
        title: 'Poziom 2: Ofensywa Kinetyczna',
        subtitle: 'Magister: Fizyka Uderzeń',
        description: 'Jak wygenerować siłę 800 PSI przy wadze 70kg? W tym module rozkładamy ciosy na czynniki pierwsze: rotację, dźwignię i timing.',
        modules: [
            {
                id: 'm3_punches',
                title: 'Moduł 2.1: Proste i Rotacja Osiowa',
                lessons: [
                    {
                        id: 'l4_jab',
                        title: 'Lewy Prosty (The Jab): Sonda i Broń',
                        content: `
                            <h3>Jab jako Narzędzie Pomiarowe</h3>
                            <p>Jab to nie tylko cios. To sonar. Uderzając, mierzysz dystans i reakcję rywala. Czas trwania jaba (od startu do powrotu) nie powinien przekraczać 300ms.</p>
                            <h4>Impuls Nerwowy</h4>
                            <p>Cios musi być "niewidoczny". Oznacza to eliminację "telegrafowania" - czyli wstępnego napięcia mięśni sygnalizującego ruch. Trenujemy rozluźnienie (Relaxation Phase) aż do momentu impaktu (Impact Phase).</p>
                        `
                    },
                    {
                        id: 'l5_cross',
                        title: 'Prawy Prosty: Łańcuch Kinetyczny',
                        content: `
                            <h3>Sekwencja Generowania Mocy</h3>
                            <p>Prawy krzyżowy wykorzystuje pełen łańcuch: Stopa -> Kolano -> Biodro -> Bark -> Łokieć -> Pięść.</p>
                            <ul>
                                <li><strong>Faza 1:</strong> Rotacja stopy tylnej (Internal Rotation).</li>
                                <li><strong>Faza 2:</strong> Przeniesienie masy na nogę przednią (Weight Transfer).</li>
                                <li><strong>Faza 3:</strong> Wyprost łokcia w ostatniej fazie (Extension Snap).</li>
                            </ul>
                            <p>Błąd w którymkolwiek ogniwie redukuje siłę uderzenia nawet o 50%.</p>
                        `
                    }
                ]
            }
        ]
    },
    {
        id: 'lvl_3',
        title: 'Poziom 3: Fizjologia i Wydolność',
        subtitle: 'Doktorat: Biohacking Organizmu',
        description: 'Trening to bodziec. Adaptacja zachodzi w kuchni i w łóżku. Zrozum systemy energetyczne i hormonalne swojego ciała.',
        modules: [
            {
                id: 'm4_systems',
                title: 'Moduł 3.1: Systemy Energetyczne w Walce',
                lessons: [
                    {
                        id: 'l6_atp',
                        title: 'System Fosfagenowy (ATP-PCr)',
                        content: `
                            <h3>Paliwo na 10 Sekund</h3>
                            <p>Podczas krótkich, eksplozywnych wymian, Twój organizm korzysta z ATP (adenozynotrifosforanu). Zasoby te wyczerpują się po ok. 10-12 sekundach maksymalnego wysiłku. Regeneracja trwa 3-5 minut.</p>
                            <h4>Trening Sprintów</h4>
                            <p>Aby zwiększyć pojemność tego systemu, stosujemy treningi typu Alactic Power: 10s pracy MAX / 5min odpoczynku. To buduje "dynamit" w rękach.</p>
                        `
                    },
                    {
                        id: 'l7_laste',
                        title: 'Próg Mleczanowy (Lactate Threshold)',
                        content: `
                            <h3>Kiedy Mięśnie Płoną</h3>
                            <p>W rundach 4-12 wchodzimy w glikolizę beztlenową. Produktem ubocznym są jony wodoru (zakwaszenie). Trening progu mleczanowego uczy organizm efektywniejszego buforowania kwasu mlekowego, co pozwala utrzymać wysokie tempo walki bez "zabetonowania" nóg.</p>
                        `
                    }
                ]
            },
            {
                id: 'm5_diet',
                title: 'Moduł 3.2: Neuro-Dietetyka',
                lessons: [
                    {
                        id: 'l8_brain',
                        title: 'Paliwo dla Mózgu: Ketony i Glukoza',
                        content: `
                            <h3>Decyzje pod Presją</h3>
                            <p>Mózg boksera zużywa 20% całej energii organizmu. W stanie hipoglikemii (niskiego cukru), kora przedczołowa "wyłącza się", a stery przejmuje prymitywne ciało migdałowate. Prowadzi to do błędów taktycznych.</p>
                            <h4>Protokół Intra-Workout</h4>
                            <p>Podczas treningu dłuższego niż 60min, zalecamy podaż dekstrozy i elektrolitów, aby utrzymać funkcje kognitywne na najwyższym poziomie.</p>
                        `
                    }
                ]
            }
        ]
    },
    {
        id: 'lvl_4',
        title: 'Poziom 4: Psychologia Pola Walki',
        subtitle: 'Profesura: Dominacja Mentalna',
        description: 'Walka kończy się zanim wejdziesz do ringu. Manipulacja, mowa ciała, kontrola strachu i stan Flow.',
        modules: [
            {
                id: 'm6_psych',
                title: 'Moduł 4.1: Wojna Psychologiczna',
                lessons: [
                    {
                        id: 'l9_dominance',
                        title: 'Ustanawianie Hierarchii (Alpha Presence)',
                        content: `
                            <h3>Mikro-Ekspresje i Mowa Ciała</h3>
                            <p>90% komunikacji jest niewerbalne. Sposób, w jaki wchodzisz do narożnika, jak patrzysz na rywala podczas instrukcji sędziego - to wszystko wysyła sygnały. Mike Tyson wygrywał walki w szatni, projektując aurę nieuchronnej destrukcji.</p>
                        `
                    }
                ]
            }
        ]
    }
];

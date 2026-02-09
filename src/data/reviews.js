export const reviews = [
    {
        id: 'r1',
        category: 'GEAR', // GEAR, FIGHT, SUPPLEMENT
        type: 'Rękawice Sparingowe',
        title: 'Winning MS-500: Święty Graal Ochrony Dłoni',
        rating: 5,
        price: '$$$$',
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop',
        summary: 'Bezkompromisowa ochrona. Jeśli Twoje dłonie są narzędziem pracy, to jest polisa ubezpieczeniowa.',
        pros: ['Niesamowita ochrona knykci', 'Trwałość (5+ lat)', 'Waga idealnie 16oz', 'Made in Japan'],
        cons: ['Cena (ok. 2000 PLN)', 'Długi czas oczekiwania na dostawę', 'Design "Old School" nie dla każdego'],
        verdict: `
            <p>Japońska inżynieria w najlepszym wydaniu. Winningi to nie są rękawice, które "oddają" siłę ciosu (jak Cleto Reyes). To poduszki, które absorbują impakt, chroniąc Twoje nadgarstki i śródręcze. Dla zawodowców to standard w treningu. Jeśli stać Cię na iPhone'a Pro, stać Cię na ochronę zdrowia.</p>
            <p><strong>Dla kogo?</strong> Dla osób z kruchymi dłońmi i zawodowców, którzy sparują 3-4 razy w tygodniu.</p>
        `
    },
    {
        id: 'r2',
        category: 'GEAR',
        type: 'Buty Bokserskie',
        title: 'Nike HyperKO 2: Technologiczny Egzoszkielet',
        rating: 4.5,
        price: '$$$',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
        summary: 'Lekkość i wsparcie kostki. Nowoczesny design, który dzieli opinie, ale łączy w wydajności.',
        pros: ['System wsparcia kostki (Flywire)', 'Przyczepność podeszwy', 'Futurystyczny wygląd'],
        cons: ['Ciasne w podbiciu (trzeba brać 0.5 rozm. większe)', 'Trudne zakładanie'],
        verdict: `
            <p>Następca legendarnych HyperKO 1. Nike poszło w stronę egzoszkieletu. But "zasysa" stopę, dając poczucie totalnej stabilności przy zmianach kierunku. Idealne dla stylów opartych na pracy nóg (Out-boxer).</p>
        `
    },
    {
        id: 'r3',
        category: 'FIGHT',
        type: 'Analiza Walki',
        title: 'Gatti vs Ward I: Anatomia Wojny',
        rating: 5,
        price: 'LEGENDARY',
        image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1000&auto=format&fit=crop',
        summary: 'Lekcja charakteru, nie techniki. Runda 9 to absolutny szczyt ludzkiej woli walki.',
        pros: ['Serce do walki', 'Zwroty akcji', 'Body punching Warda'],
        cons: ['Brak defensywy', 'Uszkodzenia mózgu (CTE) w czasie rzeczywistym'],
        verdict: `
            <p>Oglądając tę walkę, nie uczysz się unikiów. Uczysz się tego, co to znaczy "dig deep". Micky Ward pokazuję perfekcyjne wykorzystanie "lewego haka na wątrobę" po zmianie pozycji na mańkuta (switch). Arturo Gatti pokazuje, że ludzkie ciało może znieść więcej, niż podpowiada logika.</p>
        `
    },
    {
        id: 'r4',
        category: 'GEAR',
        type: 'Kask Sparingowy',
        title: 'Cleto Reyes Traditional Headgear',
        rating: 4,
        price: '$$$',
        image: 'https://images.unsplash.com/photo-1591117207239-78898dd1e2d2?q=80&w=1000&auto=format&fit=crop',
        summary: 'Meksykańska skóra, meksykański styl. Otwarta twarz dla lepszej widoczności.',
        pros: ['Widoczność 180 stopni', 'Jakość skóry', 'Niska waga'],
        cons: ['Słaba ochrona nosa', 'Sztywna wyściółka na początku'],
        verdict: `
            <p>Klasyka gatunku. Jeśli lubisz widzieć ciosy i polegasz na balansie, to kask dla Ciebie. Jeśli boisz się o nos - wybierz Winning FG-5000 (bar). Cleto Reyes wymaga "rozbicia", ale potem leży jak druga skóra.</p>
        `
    },
    {
        id: 'r5',
        category: 'SUPPLEMENT',
        type: 'Regeneracja',
        title: 'Kreatyna Monohydrat: Królowa Suplementów',
        rating: 5,
        price: '$',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000&auto=format&fit=crop',
        summary: 'Najlepiej przebadany suplement na świecie. Must-have dla mocy ATP.',
        pros: ['Tania', 'Skuteczna (udowodnione działanie)', 'Bezpieczna'],
        cons: ['Retencja wody (może być problemem przy robieniu wagi)'],
        verdict: `
            <p>Nie ma sensu przepłacać za jabłczany czy stacki. Zwykły monohydrat (Creapure) robi 100% roboty. Zwiększa zapasy fosfokreatyny, co pozwala Ci zadać 2-3 ciosy więcej w serii z pełną mocą.</p>
        `
    }
];

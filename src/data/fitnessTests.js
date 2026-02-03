
export const FITNESS_CATEGORIES = {
    FOUNDATION: { id: 'foundation', title: 'Fundamenty', weight: 0.30, color: 'text-purple-400', bg: 'bg-purple-500' },
    STRENGTH: { id: 'strength', title: 'Siła & Kontrola', weight: 0.25, color: 'text-blue-400', bg: 'bg-blue-500' },
    POWER: { id: 'power', title: 'Moc & Dynamika', weight: 0.25, color: 'text-yellow-400', bg: 'bg-yellow-500' },
    CAPACITY: { id: 'capacity', title: 'Wydolność', weight: 0.20, color: 'text-red-400', bg: 'bg-red-500' }
};

export const BASIC_TEST = [
    {
        categoryId: 'foundation',
        exercises: [
            {
                id: 'balance',
                title: 'Stanie na jednej nodze (oczy zamknięte)',
                unit: 'sek',
                isAsymmetric: true,
                instruction: 'Stań na jednej nodze, drugą unieś lekko w górę. Zamknij oczy. Mierz czas do utraty równowagi.',
                min: 5,   // 0 points
                max: 60   // 100 points
            },
            {
                id: 'plank',
                title: 'Deska (Plank)',
                unit: 'sek',
                isAsymmetric: false,
                instruction: 'Przyjmij pozycję deski na przedramionach. Ciało w linii prostej. Utrzymaj jak najdłużej.',
                min: 30,
                max: 180
            }
        ]
    },
    {
        categoryId: 'strength',
        exercises: [
            {
                id: 'pushups',
                title: 'Pompki klasyczne (Max)',
                unit: 'powt',
                isAsymmetric: false,
                instruction: 'Klasyczne pompki, klatka dotyka podłogi, pełny wyprost. Wykonaj max powtórzeń technicznych.',
                min: 5,
                max: 50
            },
            {
                id: 'lunges',
                title: 'Wykroki (1 min)',
                unit: 'powt',
                isAsymmetric: false, // Could be asymmetric but simplifed for basic 1 min test
                instruction: 'Naprzemienne wykroki w miejscu przez 60 sekund. Licz łączne powtórzenia.',
                min: 15,
                max: 60
            }
        ]
    },
    {
        categoryId: 'power',
        exercises: [
            {
                id: 'broad_jump',
                title: 'Skok w dal z miejsca',
                unit: 'cm',
                isAsymmetric: false,
                instruction: 'Stań na linii, wykonaj zamach i skocz obunóż jak najdalej. Mierz odległość do pięt.',
                min: 150,
                max: 280
            },
            {
                id: 'burpees',
                title: 'Burpees (1 min)',
                unit: 'powt',
                isAsymmetric: false,
                instruction: 'Padnij-powstań z wyskokiem i klaśnięciem nad głową. Max powtórzeń w 60 sekund.',
                min: 10,
                max: 30
            }
        ]
    },
    {
        categoryId: 'capacity',
        exercises: [
            {
                id: 'squat_hold',
                title: 'Krzesełko przy ścianie',
                unit: 'sek',
                isAsymmetric: false,
                instruction: 'Oprzyj plecy o ścianę, uda równolegle do podłogi (kąt 90 stopni). Utrzymaj pozycję.',
                min: 45,
                max: 300
            }
        ]
    }
];

export const ADVANCED_TEST = [
    {
        categoryId: 'foundation',
        exercises: [
            {
                id: 'overhead_squat',
                title: 'Przysiad z kijem nad głową (Ocena 0-10)',
                unit: 'pkt',
                isAsymmetric: false,
                instruction: 'Wykonaj głęboki przysiad z kijem nad głową. 0 = brak możliwości, 10 = perfekcyjna technika, pionowy tułów.',
                min: 0,
                max: 10
            },
            {
                id: 'single_leg_bridge',
                title: 'Single Leg Glute Bridge (Max powt)',
                unit: 'powt',
                isAsymmetric: true,
                instruction: 'Leżenie tyłem, jedna noga prosta w górze. Wznosy bioder na drugiej nodze do pełnego wyprostu.',
                min: 10,
                max: 30
            }
        ]
    },
    {
        categoryId: 'strength',
        exercises: [
            {
                id: 'pullups',
                title: 'Podciąganie na drążku (Max)',
                unit: 'powt',
                isAsymmetric: false,
                instruction: 'Siłowe podciągnięcia nachwytem. Broda nad drążek. Pełny wyprost ramion.',
                min: 0,
                max: 25
            },
            {
                id: 'test_1rm_bench',
                title: 'Wyciskanie Leżąc (1RM est.)',
                unit: 'kg', // Normalized by bodyweight later in logic? For now absolute or relative? Let's assume relative norms roughly built in or simplify standard. We asked for normalization to 0-100.
                isAsymmetric: false,
                instruction: 'Szacowane 1RM w wyciskaniu leżąc.',
                min: 40,
                max: 140 // Simplified absolute scale for generic fit male. Real pro storage would need bodyweight ratio.
            }
        ]
    },
    {
        categoryId: 'power',
        exercises: [
            {
                id: 'box_jump',
                title: 'Wyskok na skrzynię (Max wysokość)',
                unit: 'cm',
                isAsymmetric: false,
                instruction: 'Maksymalna wysokość skrzyni, na którą jesteś w stanie wskoczyć i bezpiecznie wylądować.',
                min: 50,
                max: 140
            },
            {
                id: 'medball_throw',
                title: 'Rzut piłką lekarską (Siad okroczny)',
                unit: 'm',
                isAsymmetric: false,
                instruction: 'Siedząc w rozkroku, rzut piłką 5kg oburącz zza głowy/klatki piersiowej na odległość.',
                min: 4,
                max: 12
            }
        ]
    },
    {
        categoryId: 'capacity',
        exercises: [
            {
                id: 'cooper_run',
                title: 'Test Coopera (12 min bieg)',
                unit: 'km',
                isAsymmetric: false,
                instruction: 'Przebiegnij jak największy dystans w ciągu 12 minut.',
                min: 1.5,
                max: 3.2
            }
        ]
    }
];

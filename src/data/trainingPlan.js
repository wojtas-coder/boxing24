// --- TEMPLATES (Block Building) ---

// 1. FUNDAMENTALS (Technique Focus)
const templateTechniqueA = {
    title: "TECHNIKA A",
    subtitle: "OSZCZĘDNOŚĆ RUCHU",
    sections: [
        {
            id: 'warmup',
            title: "PRZYGOTOWANIE",
            color: "border-blue-500",
            rows: [
                { id: 'w1', exercise: "SKAKANKA (Lekko)", sets: "1", reps: "3 min" },
                { id: 'w2', exercise: "WALKA Z CIENIEM (Tylko nogi)", sets: "2", reps: "2 min" }
            ]
        },
        {
            id: 'main',
            title: "ZADANIA GŁÓWNE",
            color: "border-boxing-neon",
            rows: [
                { id: 't1', exercise: "LEWY PROSTY (JAB) - Izolacja", sets: "3", reps: "3 min", rest: "1 min" },
                { id: 't2', exercise: "PRACA NÓG - Krok-Dostaw", sets: "3", reps: "3 min", rest: "1 min" }
            ]
        }
    ],
    tips: [
        { type: 'coach', text: "Luźne barki. Energia idzie z nóg, nie z ramion." },
        { type: 'info', text: "Skup się na powrocie ręki do brody (Retraction Phase)." }
    ]
};

// 2. STRENGTH (Hypertrophy Focus) - Existing Logic
const templateStrengthA = {
    title: "SIŁA A",
    subtitle: "MOTORYKA & MOC",
    sections: [
        {
            id: 'plyo',
            title: "MOC STARTOWA",
            color: "border-red-500",
            rows: [
                { id: 'p1', exercise: "BOX JUMPS", sets: "3", reps: "5", rest: "2 min" }
            ]
        },
        {
            id: 'main',
            title: "SIŁA BAZOWA",
            color: "border-boxing-green",
            rows: [
                { id: 's1', exercise: "PRZYSIAD (Goblet/Back)", sets: "4", reps: "6-8", rest: "2 min", input: true, unit: "kg" },
                { id: 's2', exercise: "WYCISKANIE HANTLI (Ławka)", sets: "4", reps: "8-10", rest: "2 min", input: true, unit: "kg" }
            ]
        }
    ]
};

// 3. CONDITIONING (Endurance Focus)
const templateConditioningA = {
    title: "KONDYCJA A",
    subtitle: "WYDOLNOŚĆ TLENOWA",
    sections: [
        {
            id: 'warmup',
            title: "ROZGRZEWKA",
            color: "border-yellow-500",
            rows: [
                { id: 'cw1', exercise: "BIEG BOKSERSKI", sets: "1", reps: "5 min" },
                { id: 'cw2', exercise: "PAJACYKI", sets: "3", reps: "50" }
            ]
        },
        {
            id: 'main',
            title: "INTERWAŁY",
            color: "border-red-500",
            rows: [
                { id: 'ct1', exercise: "BURPEES", sets: "4", reps: "20 sek", rest: "10 sek" },
                { id: 'ct2', exercise: "MOUNTAIN CLIMBERS", sets: "4", reps: "20 sek", rest: "10 sek" }
            ]
        }
    ]
};

// 4. SPEED (Dynamic Focus)
const templateSpeedA = {
    title: "SZYBKOŚĆ A",
    subtitle: "DYNAMIKA I REFLEKS",
    sections: [
        {
            id: 'warmup',
            title: "AKTYWACJA",
            color: "border-blue-400",
            rows: [
                { id: 'sw1', exercise: "PIŁECZKA TENISOWA", sets: "2", reps: "3 min" }
            ]
        },
        {
            id: 'main',
            title: "SZYBKOŚĆ RĄK",
            color: "border-boxing-neon",
            rows: [
                { id: 'st1', exercise: "SZYBKIE PROSTE (Gumy)", sets: "5", reps: "10 sek", rest: "30 sek" },
                { id: 'st2', exercise: "TARCZOWANIE", sets: "3", reps: "3 min", rest: "1 min" }
            ]
        }
    ]
};

// --- LIBRARY GENERATOR ---

const generatePlanStructure = (weeksCount, type, planId) => {
    let template;
    switch (type) {
        case 'strength': template = templateStrengthA; break;
        case 'conditioning': template = templateConditioningA; break;
        case 'speed': template = templateSpeedA; break;
        default: template = templateTechniqueA;
    }

    const schedule = [];
    for (let i = 1; i <= weeksCount; i++) {
        schedule.push({
            id: `${planId}_week-${i}`,
            weekNumber: i,
            title: `Tydzień ${i}`,
            units: [
                { id: `${planId}_w${i}a`, type: 'A', title: 'Trening A', data: template },
                { id: `${planId}_w${i}b`, type: 'B', title: 'Trening B', data: template }
            ]
        });
    }
    return schedule;
};

// --- PUBLIC LIBRARY EXPORT ---

export const plansLibrary = [
    {
        id: 'plan_fundamentals',
        title: "Fundamenty",
        subtitle: "POZIOM 1",
        description: "• Poprawna postawa i balans\n• Nauka podstawowych ciosów\n• Bezpieczeństwo ruchu",
        duration: "8 Tygodni",
        level: "Basic",
        color: "white",
        image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1000&auto=format&fit=crop",
        schedule: generatePlanStructure(8, 'technique', 'plan_fundamentals')
    },
    {
        id: 'plan_conditioning',
        title: "Żelazna Kondycja",
        subtitle: "POZIOM 1",
        description: "• Poprawa wydolności tlenowej\n• Redukcja wagi\n• Wytrzymałość w ringu",
        duration: "6 Tygodni",
        level: "Basic",
        color: "boxing-neon",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop",
        schedule: generatePlanStructure(6, 'conditioning', 'plan_conditioning')
    },
    {
        id: 'plan_footwork',
        title: "Magia Pracy Nóg",
        subtitle: "POZIOM 2",
        description: "• Poruszanie się w ringu\n• Kąty ataku i ucieczki\n• Balans ciała",
        duration: "4 Tygodnie",
        level: "Pro",
        color: "white",
        image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000&auto=format&fit=crop",
        schedule: generatePlanStructure(4, 'technique', 'plan_footwork')
    },
    {
        id: 'plan_speed',
        title: "Szybkość Kobry",
        subtitle: "POZIOM 2",
        description: "• Czas reakcji\n• Szybkość rąk\n• Eksplozywność",
        duration: "6 Tygodni",
        level: "Pro",
        color: "boxing-neon",
        image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1000&auto=format&fit=crop",
        schedule: generatePlanStructure(6, 'speed', 'plan_speed')
    },
    {
        id: 'plan_hypertrophy',
        title: "Atletyka",
        subtitle: "POZIOM 2",
        description: "• Budowa siły dynamicznej\n• Funkcjonalna masa mięśniowa\n• Redukcja tkanki tłuszczowej",
        duration: "12 Tygodni",
        level: "Pro",
        color: "boxing-green",
        image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000&auto=format&fit=crop",
        schedule: generatePlanStructure(12, 'strength', 'plan_hypertrophy')
    },
    {
        id: 'plan_defense',
        title: "Nieuchwytny",
        subtitle: "POZIOM 2",
        description: "• Bloki i parowania\n• Uniki rotacyjne\n• Kontratak",
        duration: "8 Tygodni",
        level: "Pro",
        color: "white",
        image: "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?q=80&w=1000&auto=format&fit=crop",
        schedule: generatePlanStructure(8, 'technique', 'plan_defense')
    },
    {
        id: 'plan_power',
        title: "Siła Ciosu",
        subtitle: "POZIOM 3",
        description: "• Generowanie mocy z biodra\n• Łańcuch kinetyczny\n• Nokautujące uderzenie",
        duration: "10 Tygodni",
        level: "Elite",
        color: "boxing-neon",
        image: "https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=1000&auto=format&fit=crop",
        schedule: generatePlanStructure(10, 'strength', 'plan_power')
    },
    {
        id: 'plan_elite',
        title: "Elite Fight Camp",
        subtitle: "POZIOM 3",
        description: "• Zaawansowana periodyzacja\n• Przygotowanie pod walkę\n• Pełny reżim treningowy",
        duration: "10 Tygodni",
        level: "Elite",
        locked: true,
        color: "white",
        image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1000&auto=format&fit=crop",
        schedule: []
    }
];

// Fallback for legacy code
export const fullSchedule = plansLibrary[1].schedule; 

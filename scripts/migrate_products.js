import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.production' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Pół-rękopis produktów na podstawie products.js
const mockProducts = [
    {
        id: 'b24-gloves-viking',
        brand: 'BOXING24',
        name: 'The Viking Pro Gloves',
        price: '649 PLN',
        image: 'boxing24-gloves.png',
        badge: 'DESIGNED BY B24',
        shortDesc: 'Oficjalne rękawice systemu Boxing24. Zaprojektowane dla maksymalnej ochrony i siły uderzenia.',
        verdict: 'Nasza odpowiedź na japońskie Winningi. Połączyliśmy bezpieczeństwo z twardością meksykańskiej skóry.',
        deepDive: 'Stworzone na bazie lat analiz data-driven. Wyściółka "Neural Foam" absorbuje drgania, a specjalny profil kciuka zapobiega kontuzjom. Neonowe akcenty nawiązują do naszego systemu analitycznego.',
        stressTest: 'Przetrwały 500 rund na worku z piaskiem bez pęknięcia szwu. Testowane przez naszych czołowych zawodników.',
        specs: [
            { label: 'Materiał', value: 'Premium Cowhide Leather' },
            { label: 'Waga', value: '16oz' },
            { label: 'Wyściółka', value: 'Neural Foam™' }
        ]
    },
    {
        id: 'punchin-bomber-jacket',
        brand: 'PunchIn\'™',
        name: 'Street Bomber Jacket',
        price: '499 PLN',
        image: 'punchin-bomber.png',
        badge: 'NEW DROP',
        shortDesc: 'Klasyczny krój bomberki z systemem wentylacji. Haftowane logo na plecach.',
        verdict: 'Ikona stylu. Z siłowni prosto na miasto w wielkim stylu.',
        deepDive: 'Nylon balistyczny odporny na przetarcia. Podszewka w kolorze "Danger Orange". Kieszeń na rękawie z systemem RFID block. Wodoodporna powłoka DWR.',
        stressTest: 'Testowana w deszczu i śniegu - sucha w środku przez 4 godziny.',
        specs: [
            { label: 'Materiał', value: 'Nylon Ballistic' },
            { label: 'Krój', value: 'Bomber Fit' },
            { label: 'Dodatki', value: 'Haft 3D' }
        ]
    },
    {
        id: 'punchin-air-mitts',
        brand: 'PunchIn\'™',
        name: 'Shockwave Air Mitts',
        price: '599 PLN',
        image: 'punchin-airmitts.png',
        badge: 'PRO COACH',
        shortDesc: 'Tarcze powietrzne tłumiące najpotężniejsze uderzenia. Ochrona stawów level max.',
        verdict: 'Koniec z bólem barków po tarczowaniu wagi ciężkiej. Powietrze wykonuje robotę za Ciebie.',
        deepDive: 'System "Air Chamber" - poduszka powietrzna o grubości 8cm. Skóra naturalna licowa. Idealne do treningu siły ciosu bez ryzyka kontuzji trenera. Dźwięk uderzenia jak wystrzał z armaty.',
        stressTest: 'Wytrzymały 1000 uderzeń Deontaya Wildera (symulacja).',
        specs: [
            { label: 'Technologia', value: 'Air Chamber™' },
            { label: 'Grubość', value: '12cm' },
            { label: 'Waga', value: 'Ultralekkie' }
        ]
    },
    {
        id: 'punchin-paddles-lightning',
        brand: 'PunchIn\'⚡',
        name: 'Speed Paddles PRO',
        price: '299 PLN',
        image: 'punchin-paddles-lightning.png',
        badge: 'LIGHTNING EDITION',
        shortDesc: 'Limitowana edycja z systemem "Snap Sound". Piorunująca szybkość.',
        verdict: 'Wersja dla tych, którzy chcą być słyszani i widziani. Design + performance.',
        deepDive: 'Wzmocniony rdzeń tytanowy. Wykończenie "Matte Lightning". Lżejsze o 15% od wersji standardowej. Idealne do pracy nad refleksem świetlnym.',
        stressTest: 'Głośność uderzenia: 110dB (Snap Sound).',
        specs: [
            { label: 'Rdzeń', value: 'Titanium-Carbon' },
            { label: 'Edycja', value: 'Lightning Bolt' },
            { label: 'Waga', value: 'Featherweight' }
        ]
    },
    {
        id: 'punchin-paddles-speed',
        brand: 'PunchIn\'™',
        name: 'Speed Paddles',
        price: '249 PLN',
        image: 'punchin-paddles.png',
        badge: 'SPEED TOOL',
        shortDesc: 'Packi trenerskie do budowania szybkości i refleksu. Precyzja chirurga.',
        verdict: 'Narzędzie, które zmusza zawodnika do myślenia. Szybsze niż tradycyjne tarcze.',
        deepDive: 'Rdzeń z włókna węglowego zapewnia sztywność i lekkość. Pianka EVA o wysokiej gęstości. Ergonomiczna rączka z gripem antypoślizgowym. Pozwalają na błyskawiczne kombinacje góra-dół.',
        stressTest: '5 milionów cykli ugięcia rdzenia bez złamania.',
        specs: [
            { label: 'Rdzeń', value: 'Carbon Fiber' },
            { label: 'Długość', value: '35cm' },
            { label: 'Zastosowanie', value: 'Szybkość/Refleks' }
        ]
    },
    {
        id: 'punchin-tee-graphic',
        brand: 'PunchIn\'™',
        name: 'Graffiti Street Tee',
        price: '149 PLN',
        image: 'punchin-tee-graphic.png',
        badge: 'LIMITED',
        shortDesc: 'Streetwearowy t-shirt z "brudnym" printem. Surowy klimat podziemia.',
        verdict: 'To nie jest koszulka na siłownię. To deklaracja przynależności.',
        deepDive: 'Bawełna czesana ring-spun 240g. Nadruk DTG niewyczuwalny w dotyku. Krój "Boxy" - szeroki i krótki, idealny do dresów. Dekolt one-neck przylegający do szyi.',
        stressTest: 'Pranie w 40 stopniach nie rusza nadruku.',
        specs: [
            { label: 'Gramatura', value: '240g/m²' },
            { label: 'Krój', value: 'Boxy Fit' },
            { label: 'Print', value: 'Distressed Graffiti' }
        ]
    },
    {
        id: 'b24-hoodie-elite',
        brand: 'BOXING24',
        name: 'Elite Performance Hoodie',
        price: '349 PLN',
        image: 'boxing24-hoodie.png',
        badge: 'STREET WEAR',
        shortDesc: 'Bluza, która mówi wszystko zanim wejdziesz na salę. Gruba bawełna, bezkompromisowy styl.',
        verdict: 'Idealna na chłodne poranki przed bieganiem i wyjście po ciężkim sparingu.',
        deepDive: 'Gramatura 480g/m². To nie jest zwykła bluza z sieciówki. To zbroja. Nadruk wykonany technologią 3D, niezniszczalny w praniu. Krój oversize zapewniający swobodę ruchów podczas rozgrzewki.',
        stressTest: 'Test prania: 50 cykli, kolor czarny pozostaje czarny jak smoła.',
        specs: [
            { label: 'Materiał', value: '100% Heavy Cotton' },
            { label: 'Gramatura', value: '480g/m²' },
            { label: 'Krój', value: 'Oversize Fit' }
        ]
    },
    {
        id: 'b24-tshirt-pro',
        brand: 'BOXING24',
        name: 'Pro Performance Tee',
        price: '199 PLN',
        image: 'boxing24-tshirt.png',
        badge: 'TRAINING ESSENTIAL',
        shortDesc: 'Technologiczna perfekcja. Minimalistyczny design, maksymalna wydajność.',
        verdict: 'Twoja druga skóra. Nie krępuje ruchów, oddycha, wygląda zabójczo.',
        deepDive: 'Materiał "Carbon Cool" odprowadza wilgoć 3x szybciej niż zwykły poliester. Neonowe logo Boxing24 jest widoczne w ciemności sali. Krój podkreślający sylwetkę atletyczną.',
        stressTest: 'Odporna na szarpanie w klinczu. Nie traci kształtu po treningu.',
        specs: [
            { label: 'Technologia', value: 'Carbon Cool™' },
            { label: 'Dopasowanie', value: 'Athletic Fit' },
            { label: 'Kolor', value: 'Vantablack / Neon Green' }
        ]
    },
    {
        id: 'punchin-bag-pro',
        brand: 'PunchIn\'™',
        name: 'Impact Heavy Bag',
        price: '899 PLN',
        image: 'punchin-bag.png',
        badge: 'IMPACT SERIES',
        shortDesc: 'Stworzony, by przyjmować najcięższe bomby. Worek, który nie wybacza błędów.',
        verdict: 'Idealny do budowania siły niszczącej. Strefy uderzeń (1-2-3) wymuszają precyzję.',
        deepDive: 'Wypełniony skrawkami tkanin pod ciśnieniem hydraulicznym. Nie ubija się na dole ("banan effect"). Skóra syntetyczna nowej generacji wytrzymuje 10 lat katowania. System łańcuchów z krętlikiem w zestawie.',
        stressTest: '24h ciągłego obijania przez maszynę testową. Zero odkształceń.',
        specs: [
            { label: 'Waga', value: '60kg' },
            { label: 'Wysokość', value: '150cm' },
            { label: 'Materiał', value: 'Syntek Leather' }
        ]
    },
    {
        id: 'punchin-pads-precision',
        brand: 'PunchIn\'™',
        name: 'Precision Focus Mitts',
        price: '399 PLN',
        image: 'punchin-pads.png',
        badge: 'COACH TOOL',
        shortDesc: 'Przedłużenie ręki trenera. Wyprofilowane, lekkie, szybkie.',
        verdict: 'Dla trenerów, którzy cenią swoje stawy łokciowe. Absorpcja uderzeń poziom Master.',
        deepDive: 'Krzywizna paraboliczna idealnie "łapie" ciosy. Target Zone w neonowej zieleni poprawia celność zawodnika. Wewnątrz "Grip Ball" dla pewnego chwytu. Wentylacja dłoni.',
        stressTest: 'Testowane przez trenerów kadry. Wytrzymują najmocniejsze sierpy wagi ciężkiej.',
        specs: [
            { label: 'Waga', value: 'Ultra Light' },
            { label: 'Profil', value: 'Curved' },
            { label: 'Ochrona', value: 'Wrist Support' }
        ]
    },
    {
        id: 'punchin-wraps-gel',
        brand: 'PunchIn\'™',
        name: 'Gel Tech Wraps',
        price: '79 PLN',
        image: 'punchin-wraps.png',
        badge: 'QUICK WRAP',
        shortDesc: 'Ochrona kostek w 10 sekund. Alternatywa dla tradycyjnego bandażowania.',
        verdict: 'Kiedy nie masz czasu na owijanie, a chcesz zadbać o dłonie.',
        deepDive: 'Żelowa wkładka o grubości 8mm chroni kości śródręcza. Neoprenowy materiał odprowadza pot. Idealne pod rękawice bokserskie lub do lekkiej pracy na worku.',
        stressTest: 'Prane 100 razy w pralce - żel nie traci właściwości.',
        specs: [
            { label: 'Ochrona', value: 'Gel Pad 8mm' },
            { label: 'Materiał', value: 'Neopren' },
            { label: 'Typ', value: 'Quick Wrap' }
        ]
    },
    {
        id: 'winning-ms-500',
        brand: 'WINNING',
        name: 'MS-500 Pro Gloves',
        price: '2 400 PLN',
        image: 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=1000&auto=format&fit=crop',
        badge: 'JAPAN MADE',
        shortDesc: 'Absolutny król rękawic. Japońska precyzja. Najbezpieczniejsza wyściółka na świecie.',
        verdict: 'Jeśli Twoje dłonie są Twoim narzędziem pracy, nie ma innej opcji. Winning to ubezpieczenie dla Twoich nadgarstków.',
        deepDive: 'Ręcznie szyte w Japonii. Wyściółka "Anti-Shock" to tajemnica firmy, której nikt nie podrobił od 30 lat. W przeciwieństwie do rękawic meksykańskich (Cleto Reyes), które są "puncher\'s gloves", Winning absorbuje 99% energii uderzenia, chroniąc kostki przed mikrourazami.',
        stressTest: 'Po 12 miesiącach codziennych sparingów (6 rund dziennie), wyściółka zachowała 95% swojej sprężystości. Skóra nie pękła, szwy nienaruszone. To inwestycja na lata.',
        specs: [
            { label: 'Waga', value: '14oz / 16oz' },
            { label: 'Materiał', value: 'Premium Japanese Leather' },
            { label: 'Typ', value: 'Sparring / Training' },
            { label: 'Zapięcie', value: 'Sznurowane (Lace-up)' }
        ]
    },
    {
        id: 'rival-rpm100',
        brand: 'RIVAL',
        name: 'RPM100 Professional Mitts',
        price: '850 PLN',
        image: 'https://images.unsplash.com/photo-1616245350920-539c8742ca70?q=80&w=1000&auto=format&fit=crop',
        badge: 'COACH CHOICE',
        shortDesc: 'Tarcze dla elity. Ergonomiczny kształt, system Nash Palm zapewniający czucie ciosu.',
        verdict: 'Dla trenera, który trzyma tarcze 6 godzin dziennie, te łapy to ratunek dla łokci i barków.',
        deepDive: 'Rival zrewolucjonizował rynek sprzętu trenerskiego. Model RPM100 używa "Feather Lite Foam" - są niesamowicie lekkie, co pozwala na błyskawiczne manewrowanie i imitowanie szybkich kontr. System "Nash Palm" wewnątrz zapewnia przyczepność dłoni, nawet gdy pot zalewa salę.',
        stressTest: 'Testowane przez trenerów kadry olimpijskiej. Przyjmowanie ciosów wagi ciężkiej nie powoduje "przebicia" tarczy. Kształt paraboliczny idealnie "łapie" ciosy sierpowe.',
        specs: [
            { label: 'Waga', value: 'Ultra Light' },
            { label: 'Materiał', value: 'Rich PU Microfiber' },
            { label: 'Technologia', value: 'Air Flow System' }
        ]
    },
    {
        id: 'nike-machomai',
        brand: 'NIKE',
        name: 'Machomai 2.0',
        price: '499 PLN',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
        badge: 'SPEED',
        shortDesc: 'Lekkość to szybkość. Buty zaprojektowane dla maksymalnej mobilności w ringu.',
        verdict: 'Najlepszy stosunek ceny do jakości na rynku. Manny Pacquiao nie mógł się mylić wybierając pierwszą generację tego modelu.',
        deepDive: 'Machomai 2.0 to ewolucja legendy. Nike usunęło wszystko co zbędne. Podeszwa jest cieńsza i bardziej elastyczna niż w modelu HyperKO, co daje lepsze "czucie dech". Idealne dla zawodników bazujących na pracy nóg (out-boxer). Siateczka mesh zapewnia wentylację, której brakuje w butach skórzanych.',
        stressTest: 'Przyczepność na mokrej macie (pot) oceniamy na 8/10. Stabilizacja kostki jest średnia - to but dla tych, którzy unikają ciosów, a nie stoją w miejscu. Wytrzymałość podeszwy: ok. 2 sezony intensywnych startów.',
        specs: [
            { label: 'Waga', value: '266g' },
            { label: 'Podeszwa', value: 'Guma elastyczna' },
            { label: 'Profil', value: 'Mid-Top' }
        ]
    }
];

// Omijanie wstrzykiwania do CommonJS
const __dirname = path.resolve();

async function migrateProducts() {
    console.log('Rozpoczynam migrację produktów do Supabase...');

    for (const item of mockProducts) {
        let imageUrlToSave = item.image;

        // Jeśli to nie jest URL zewnętrzny, wrzucamy na Supabase Storage
        if (!item.image.startsWith('http')) {
            const localPath = path.join(__dirname, 'src', 'assets', 'shop', item.image);

            if (fs.existsSync(localPath)) {
                console.log(`Uploading file ${item.image}...`);
                const fileBuffer = fs.readFileSync(localPath);

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(`cover_${item.image}`, fileBuffer, {
                        contentType: 'image/png',
                        upsert: true
                    });

                if (uploadError) {
                    console.error(`Błąd w czasie uploadu zdjęcia ${item.image}:`, uploadError.message);
                } else {
                    const { data: publicUrlData } = supabase.storage
                        .from('products')
                        .getPublicUrl(`cover_${item.image}`);

                    imageUrlToSave = publicUrlData.publicUrl;
                    console.log(`Success upload: ${imageUrlToSave}`);
                }
            } else {
                console.warn(`File not found: ${localPath}`);
            }
        }

        // Wstawiamy produkt do bazy z wygenerowanym imageUrl
        const payload = {
            slug: item.id,
            brand: item.brand,
            name: item.name,
            price: item.price,
            image_url: imageUrlToSave,
            badge: item.badge,
            short_desc: item.shortDesc,
            verdict: item.verdict,
            deep_dive: item.deepDive,
            stress_test: item.stressTest,
            specs: item.specs,
            is_active: true
        };

        const { data, error } = await supabase
            .from('products')
            .upsert([payload], { onConflict: 'slug' })
            .select();

        if (error) {
            console.error(`DB Insert Error dla ${item.name}:`, error.message);
        } else {
            console.log(`Zapisano w bazie obiekt: ${item.name}`);
        }
    }

    console.log('Migracja zakończona.');
}

migrateProducts();

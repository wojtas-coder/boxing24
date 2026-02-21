import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');
const envFile = fs.readFileSync(envPath, 'utf8');

const getEnv = (key) => {
    const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
};

const supabaseUrl = process.env.VITE_SUPABASE_URL || getEnv('VITE_SUPABASE_URL');
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseKey) {
    console.error("No service role or anon key found in env.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const coaches = [
    {
        id: 'wojciech-rewczuk',
        name: 'Wojciech Rewczuk',
        location: 'Wrocław / Cała Polska',
        title: 'Twórca Boxing24',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2025/11/Wojciech-Rewczuk.png',
        description: 'Twórca systemu Boxing24. Współzałożyciel Underground Boxing Club. Certyfikowany trener II klasy sportowej. Od wielu lat pracuje z zawodnikami i amatorami, skupiając się na technice, pracy na tarczy oraz taktyce ringowej. Stawia na mądry boks: ruch, kontrolę dystansu i skuteczne decyzje w walce.',
        specialties: ['Technika', 'Sparingi', 'Taktyka'],
        price: '200 PLN',
        calLink: 'wojciech'
    },
    {
        id: 'adam-bylina',
        name: 'Adam Bylina',
        location: 'Biała Podlaska',
        title: 'Współzałożyciel UBC',
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=400&auto=format&fit=crop',
        description: 'Współzałożyciel Underground Boxing Club. Doświadczony trener i zawodnik, ekspert od przygotowania motorycznego i siłowego. W pracy skupia się na poprawnych wzorcach ruchowych, budując fundamenty pod skuteczną walkę. Siła i sprawność to jego priorytet.',
        specialties: ['Motoryka', 'Siła', 'Wzorce Ruchowe'],
        price: '200 PLN',
        calLink: 'adam'
    }
];

async function seedCoaches() {
    console.log(`Znalazłem ${coaches.length} trenerów w pliku JS. Zaczynam migrację...`);

    for (let i = 0; i < coaches.length; i++) {
        const coach = coaches[i];

        const dbCoachInfo = {
            name: coach.name,
            location: coach.location,
            title: coach.title,
            image_url: coach.image,
            description: coach.description,
            specialties: coach.specialties,
            price: coach.price,
            cal_link: coach.calLink,
            order_index: i + 1,
            is_active: true
        };

        const { error } = await supabase
            .from('coaches')
            .upsert(dbCoachInfo, { onConflict: 'cal_link' });

        if (error) {
            console.error(`Błąd przy dodawaniu trenera ${coach.name}:`, error.message);
        } else {
            console.log(`✅ Trener ${coach.name} został pomyślnie zmigrowany!`);
        }
    }
}

seedCoaches();

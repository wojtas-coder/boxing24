
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const news = [
    {
        title: 'Joshua vs Dubois II – Londyn zapłonie we wrześniu!',
        slug: 'joshua-vs-dubois-2-londyn-wrzesien-2026',
        lead: 'Anthony Joshua oficjalnie potwierdził rewanż z Danielem Dubois. Starcie o dziedzictwo brytyjskiej wagi ciężkiej odbędzie się na Wembley.',
        content: 'Anthony Joshua przerwał milczenie podczas dzisiejszej konferencji prasowej w Londynie. AJ oficjalnie potwierdził, że aktywuje klauzulę rewanżu z Danielem Dubois. Pojedynek zaplanowano na wrzesień 2026 roku na stadionie Wembley w ramach projektu Riyadh Season.\n\n"Nie przyszedłem tu, żeby przetrwać. Przyszedłem, żeby odzyskać to, co moje" – zadeklarował Joshua. Dla fanów boksu to wiadomość roku. Dubois, który w pierwszej walce zszokował świat, zapowiada, że tym razem „emerytura AJ-a stanie się faktem”. Ten pojedynek to nie tylko walka o pasy, to starcie o dziedzictwo brytyjskiej wagi ciężkiej.',
        category: 'Boks Zawodowy',
        image_url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1200',
        author_name: 'Redakcja Boxing24',
        is_breaking: true,
        created_at: '2026-02-11T10:00:00Z'
    },
    {
        title: 'WROCŁAW: Inwazja na Krupniczą. Ponad 100 zawodników w grze!',
        slug: 'wroclaw-sobota-bokserska-rekord-frekwencji-2026',
        lead: 'Absolutny rekord frekwencji we Wrocławiu! Ponad 100 zawodników zgłoszonych do Soboty Bokserskiej przy ul. Krupniczej.',
        content: 'Atmosfera przed Sobotą Bokserską (14.02) we Wrocławiu jest gęstsza niż kiedykolwiek. DOZB poinformował dziś, że liczba zgłoszeń przekroczyła magiczną barierę 100 zawodników. To absolutny rekord frekwencji w historii turniejów regionalnych na Dolnym Śląsku.\n\nHala przy ul. Krupniczej zostanie podzielona na dwa ringi, aby pomieścić wszystkie zestawienia. Trenerzy wrocławskich klubów (m.in. Gwardia Wrocław i Adrenalina) zapowiadają wystawienie swoich najmocniejszych składów w kategorii kadet i junior.',
        category: 'Wrocław',
        image_url: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?q=80&w=1200',
        author_name: 'Redakcja Boxing24',
        is_breaking: false,
        created_at: '2026-02-11T11:00:00Z'
    },
    {
        title: 'PRO-TALK: Canelo Alvarez stawia ultimatum federacjom',
        slug: 'canelo-alvarez-ultimatum-federacje-the-ring-2026',
        lead: 'Saul "Canelo" Alvarez ogłosił, że nie będzie bronił pasów na narzuconych warunkach. Czy czeka nas mega-walka z Crawfordem?',
        content: 'Dzisiejsze wydanie The Ring przynosi sensacyjne doniesienia z obozu Saula "Canelo" Alvareza. Meksykański król P4P ogłosił, że nie zamierza bronić pasów z narzuconymi pretendentami, jeśli federacje nie zgodzą się na jego warunki finansowe.\n\n"Zrobiłem dla tego sportu więcej niż ktokolwiek inny. Teraz boks potrzebuje mnie bardziej niż ja bokserskich pasów" – uciął Canelo. W kuluarach mówi się, że Alvarez celuje w mega-walkę z Terence\'em Crawfordem w limicie 168 funtów.',
        category: 'Boks Zawodowy',
        image_url: 'https://images.unsplash.com/photo-1509563268479-0f004cf3f58b?q=80&w=1200',
        author_name: 'Redakcja Boxing24',
        is_breaking: false,
        created_at: '2026-02-11T12:00:00Z'
    },
    {
        title: 'PERSPEKTYWA TRENERA: "Dlaczego boks to sport dla elit?"',
        slug: 'perspektywa-trenera-boks-sport-dla-elit-mental-2026',
        lead: 'Siła bez strategii jest bezużyteczna. Analiza mentalnego podejścia AJ-a i nowoczesnych metod treningowych.',
        content: 'Boks zawodowy ewoluuje. Dzisiejsze gwiazdy, jak Joshua czy Canelo, to nie tylko sportowcy – to precyzyjnie nastrojone maszyny. Ale to, co odróżnia mistrza od amatora, dzieje się w głowie.\n\nAnalizując dzisiejszą konferencję AJ-a, widzimy zawodnika, który zrozumiał, że siła bez precyzji i strategii jest bezużyteczna. To samo podejście stosujemy w boxing24.pl. Nie uczymy Cię tylko jak bić – uczymy Cię jak myśleć w ringu, jak zarządzać przestrzenią i jak budować kondycję.',
        category: 'Psychologia',
        image_url: 'https://images.unsplash.com/photo-1552072805-2a9039d00e57?q=80&w=1200',
        author_name: 'Wojciech Rewczuk',
        is_breaking: false,
        created_at: '2026-02-11T13:00:00Z'
    }
];

async function insertNews() {
    console.log('Inserting news...');
    const { data, error } = await supabase.from('news').insert(news);
    if (error) {
        console.error('Error inserting news:', error);
        process.exit(1);
    }
    console.log('Successfully inserted news:', data);
    process.exit(0);
}

insertNews();

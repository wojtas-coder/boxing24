
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const NEWS_FILE = path.join(path.dirname(__filename), '../src/data/news.json');

const newArticles = [
    {
        "id": "B24-20260205-FULL-01",
        "title": "Benavidez vs Morrell: Szachy w cieniu nokautu. Analiza starcia tytanów",
        "category": "Świat / Boks Zawodowy",
        "image_url": "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=1200",
        "summary": "To nie jest zwykła walka o pas. To zderzenie dwóch najbardziej niszczycielskich sił w wadze półciężkiej. David Benavidez i David Morrell wchodzą na kurs kolizyjny.",
        "content": "Świat boksu zawodowego wstrzymał oddech, gdy federacja WBC oficjalnie zatwierdziła pojedynek Davida Benavideza z Davidem Morrellem. Eksperci są zgodni: to najbardziej wyczekiwane starcie w kategorii półciężkiej od lat. Benavidez, znany jako 'The Mexican Monster', wnosi do ringu nieustanną presję i mordercze tempo, któremu niewielu jest w stanie sprostać. Z drugiej strony mamy Morrella – genialnego technika ze szkoły kubańskiej, który łączy w sobie elegancję ruchu z brutalną siłą ciosu. \n\nKluczem do zwycięstwa w tym pojedynku będzie wydolność. Podczas gdy Benavidez zazwyczaj przełamuje rywali w drugiej połowie walki, Morrell potrafi 'zamknąć' przeciwnika w swojej grze defensywnej już od pierwszej rundy. Dla kibiców to gratka, dla analityków – zagadka. Na boxing24.pl będziemy śledzić każdy etap ich przygotowań, analizując detale techniczne, które mogą zdecydować o tym, kto opuści Las Vegas z pasem na biodrach.",
        "cta": "Chcesz trenować z intensywnością godną Benavideza? Zarezerwuj swój trening personalny i naucz się generować niszczycielską siłę ciosu."
    },
    {
        "id": "B24-20260205-FULL-02",
        "title": "Wrocławska Orbita zapłonie. MB Boxing Night 27 to więcej niż gala",
        "category": "Polska / Wrocław",
        "image_url": "https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&q=80&w=1200",
        "summary": "Gorączka biletowa we Wrocławiu trwa. Gala 'Bloody Friday II' zapowiada się jako najważniejsze sportowe wydarzenie marca na Dolnym Śląsku.",
        "content": "Hala Orbita ma w sobie coś magicznego, gdy trybuny wypełniają się fanami boksu. Mateusz Borek i grupa MB Promotions postawili poprzeczkę bardzo wysoko. Gala zaplanowana na 6 marca to nie tylko karta walk pełna prospektów, to przede wszystkim wielki powrót boksu zawodowego do Wrocławia w jego najczystszej postaci. \n\nZ naszych informacji wynika, że karta walk została skrojona tak, aby fani zobaczyli starcia 'polsko-polskie', które zawsze gwarantują najwięcej emocji. Wrocław jako miasto z ogromnymi tradycjami bokserskimi zasługuje na wydarzenie tej rangi. Atmosfera na treningach w lokalnych klubach już teraz gęstnieje – każdy chce być częścią tego święta. My w boxing24.pl nie tylko będziemy tam obecni, ale dostarczymy Wam relacje zza kulis, których nie znajdziecie nigdzie indziej. To moment, w którym Wrocław ponownie staje się bokserskim sercem Polski.",
        "cta": "Nie bądź tylko widzem w Orbicie. Wejdź na ring z profesjonalistą – zarezerwuj swój trening personalny już teraz."
    },
    {
        "id": "B24-20260205-FULL-03",
        "title": "Koniec zgrupowania w Wałczu. Czy Kadra Narodowa jest gotowa na sukces?",
        "category": "Olimpijski / Polska",
        "image_url": "https://images.unsplash.com/photo-1509563268479-0f004cf3f58b?auto=format&fit=crop&q=80&w=1200",
        "summary": "Tomasz Dylak i jego sztab kończą intensywne zgrupowanie. Nowoczesne metody szkoleniowe mają przynieść Polsce upragnione medale.",
        "content": "Centralny Ośrodek Sportu w Wałczu był w ostatnich tygodniach świadkiem katorżniczej pracy naszych reprezentów. Pod czujnym okiem Tomasza Dylaka, kadra narodowa seniorów przeszła transformację. Zrezygnowano ze staromodnych metod na rzecz analizy wideo w czasie rzeczywistym i precyzyjnego monitorowania parametrów fizycznych zawodników. \n\n'Boks olimpijski ewoluuje. Dziś wygrywa ten, kto szybciej adaptuje się do zmian' – słyszymy ze sztabu. Polska kadra stawia na mobilność i agresywne kontrataki. Wyniki ostatnich sparingów napawają optymizmem przed nadchodzącym World Boxing Cup. Dla nas, obserwatorów, to sygnał, że polski boks amatorski w końcu idzie w stronę profesjonalizacji, na którą czekaliśmy od dekad. Na boxing24.pl będziemy śledzić drogę każdego z naszych kadrowiczów.",
        "cta": "Wykorzystaj naukowe podejście do boksu w swoim treningu. Przejdź do rezerwacji treningu personalnego i poczuj różnicę."
    }
];

function slugify(text) {
    return text.toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

try {
    let existing = [];
    if (fs.existsSync(NEWS_FILE)) {
        existing = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
    }

    const processed = newArticles.map(a => ({
        id: a.id,
        title: a.title,
        slug: slugify(a.title),
        excerpt: a.summary, // Map summary to excerpt
        content: a.content + (a.cta ? `<br/><br/><strong>${a.cta}</strong>` : ''), // Append CTA to content or handle separately? Simple append for now.
        category: a.category,
        image_url: a.image_url,
        author: 'Redakcja Boxing24',
        published_at: new Date().toISOString(),
        is_manual: true
    }));

    // Merge: Add new ones at TOP
    const merged = [...processed, ...existing];

    // Dedup by title
    const unique = [];
    const titles = new Set();
    for (const item of merged) {
        if (!titles.has(item.title)) {
            titles.add(item.title);
            unique.push(item);
        }
    }

    fs.writeFileSync(NEWS_FILE, JSON.stringify(unique, null, 2));
    console.log(`✅ Injected ${processed.length} articles.`);

} catch (e) {
    console.error("Error:", e);
}

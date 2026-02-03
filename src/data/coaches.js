import adamImg from '../assets/adam-bylina.jpg';

export const coaches = [
    {
        id: 'wojciech-rewczuk',
        name: 'Wojciech Rewczuk',
        location: 'Wrocław / Cała Polska',
        title: 'Twórca Boxing24',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2025/11/Wojciech-Rewczuk.png',
        description: 'Twórca systemu Boxing24. Współzałożyciel Underground Boxing Club. Certyfikowany trener II klasy sportowej. Od wielu lat pracuje z zawodnikami i amatorami, skupiając się na technice, pracy na tarczy oraz taktyce ringowej. Stawia na mądry boks: ruch, kontrolę dystansu i skuteczne decyzje w walce.',
        specialties: ['Technika', 'Sparingi', 'Taktyka'],
        price: '200 PLN'
    },
    {
        id: 'adam-bylina',
        name: 'Adam Bylina',
        location: 'Biała Podlaska',
        title: 'Współzałożyciel UBC',
        image: adamImg,
        description: 'Współzałożyciel Underground Boxing Club. Doświadczony trener i zawodnik, ekspert od przygotowania motorycznego i siłowego. W pracy skupia się na poprawnych wzorcach ruchowych, budując fundamenty pod skuteczną walkę. Siła i sprawność to jego priorytet.',
        specialties: ['Motoryka', 'Siła', 'Wzorce Ruchowe'],
        price: '200 PLN'
    },
    {
        id: 'albert-sosnowski',
        name: 'Albert Sosnowski',
        location: 'Warszawa',
        title: 'Były Pretendent do MŚ WBC',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2025/11/Albert-Sosnowski.png',
        description: 'Mistrz świata organizacji WBF (2006-2007) i mistrz Europy EBU (2009–2010). W swojej karierze stoczył legendarne walki m.in. z Witalijem Kliczko. Po karierze zawodowej spełnia się jako trener boksu, dzieląc się doświadczeniem z najwyższego poziomu.',
        specialties: ['Boks Zawodowy', 'Taktyka', 'Mental'],
        price: '300 PLN'
    },
    {
        id: 'mariusz-wach',
        name: 'Mariusz Wach',
        location: 'Kraków',
        title: '„The Viking”',
        imagePosition: 'top',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2022/11/Mariusz-Wach.png',
        description: 'Jeden z najbardziej znanych polskich pięściarzy zawodowych. Zdobywca pasa mistrza świata federacji WBC International oraz TWBA w wadze ciężkiej. Mierzył się z Kliczko, Powietkinem i Whyte’em. Słynie z niesamowitej odporności i siły fizycznej.',
        specialties: ['Waga Ciężka', 'Siła', 'Dystans'],
        price: '350 PLN'
    },
    {
        id: 'krzysztof-glowacki',
        name: 'Krzysztof Głowacki',
        location: 'Warszawa / Legionowo',
        title: 'Były Mistrz Świata WBO',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2024/12/8.svg',
        description: 'Dwukrotny mistrz świata World Boxing Organization. Legendarny "Główka", pogromca Marco Hucka. Specjalista od lewego sierpowego i niesłabnącego charakteru w ringu. Od 2023 roku próbuje swoich sił również w MMA (KSW).',
        specialties: ['Mistrzowski Mental', 'Siła Ciosu', 'Southpaw'],
        price: '500 PLN'
    },
    {
        id: 'maciej-sulecki',
        name: 'Maciej Sulęcki',
        location: 'Warszawa',
        title: '„Striczu”',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2022/11/Maciej-Sulecki.png',
        description: 'Jeden z najlepszych polskich pięściarzy bez podziału na kategorie wagowe. Były pretendent do tytułu mistrza świata w boksie. Szlifował formę pod okiem wybitnego Andrzeja Gmitruka. Łączy karierę w USA z prowadzeniem treningów w Polsce.',
        specialties: ['Technika', 'Szybkość', 'Praca Nóg'],
        price: '300 PLN'
    },
    {
        id: 'michal-cieslak',
        name: 'Michał Cieślak',
        location: 'Warszawa',
        title: 'Top Cruiserweight',
        imagePosition: 'top',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2024/11/Michal-Cieslak.png',
        description: 'Zawodnik boksu z wieloletnim doświadczeniem, aktualny mistrz Europy w swojej kategorii wagowej. Dwukrotny pretendent do tytułu mistrza świata. Znany z agresywnego stylu, presji i nokautującego uderzenia.',
        specialties: ['Ofensywa', 'Presja', 'Kondycja'],
        price: '300 PLN'
    },
    {
        id: 'zbigniew-raubo',
        name: 'Zbigniew Raubo',
        location: 'Warszawa',
        title: 'Legenda Trenerki',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2024/11/zbigniew-raubo.png',
        description: 'Jeden z najbardziej znanych polskich trenerów. Wychowawca takich zawodników jak Przemysław Saleta, Maciej Zegan, Krzysztof Włodarczyk czy Artur Szpilka. Były trener reprezentacji Polski kadetów. "Stara szkoła" w najlepszym wydaniu.',
        specialties: ['Old School', 'Podstawy', 'Charakter'],
        price: '165 PLN'
    },
    {
        id: 'piotr-wilczewski',
        name: 'Piotr Wilczewski',
        location: 'Wrocław / Dzierżoniów',
        title: '„Wilk”',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2024/11/4.svg',
        description: 'Uznawany za jednego z najlepszych trenerów w Polsce. Były mistrz Europy i zdobywca pasa WBF International. Taktyk i strateg, który w narożniku widzi więcej niż inni.',
        specialties: ['Taktyka', 'Narożnik', 'Analiza'],
        price: '275 PLN'
    },
    {
        id: 'krzysztof-kosedowski',
        name: 'Krzysztof Kosedowski',
        location: 'Warszawa',
        title: 'Medalista Olimpijski',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2022/11/Krzysztof-Kosedowski.png',
        description: 'Brązowy medalista Igrzysk Olimpijskich w Moskwie (1980), czterokrotny mistrz Polski. Legendarna postać ("Czy jest tu jakiś cwaniak?"). Wymagający szkoleniowiec z ogromnym bagażem doświadczeń.',
        specialties: ['Boks Olimpijski', 'Technika', 'Historia'],
        price: '150 PLN'
    },
    {
        id: 'maciej-zegan',
        name: 'Maciej Zegan',
        location: 'Wrocław',
        title: 'Mistrz Techniki',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2024/11/Projekt-bez-nazwy.png',
        description: 'Wieloletni zawodnik czołówki światowej i pretendent do tytułu mistrza świata. Trener z powołania, świetne podejście zarówno do zawodowców, jak i amatorów. Prowadzi treningi we Wrocławiu.',
        specialties: ['Technika', 'Obrona', 'Kontra'],
        price: '220 PLN'
    },
    {
        id: 'dariusz-sek',
        name: 'Dariusz Sęk',
        location: 'Warszawa',
        title: 'Doświadczony Pro',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2022/11/Dariusz-Sek.png',
        description: 'Pięściarz z blisko 20-letnim stażem. Wielokrotny medalista mistrzostw Polski, zdobywca pasa TWBA. Multimedalista turniejów międzynarodowych. Swoim doświadczeniem dzieli się teraz jako trener szermierki na pięści.',
        specialties: ['Lewa Ręka', 'Dystans', 'Technika'],
        price: '165 PLN'
    },
    {
        id: 'andrzej-liczik',
        name: 'Andrzej Liczik',
        location: 'Warszawa',
        title: 'Trener Mistrzów',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2024/11/2.svg',
        description: 'Polski pięściarz amatorski pochodzenia ukraińskiego. Mistrz Polski i brązowy medalista ME. Obecnie trener czołowych zawodowców: Krzysztofa Włodarczyka, Michała Cieślaka czy Fiodora Czerkaszyna.',
        specialties: ['Profesjonalizm', 'Motoryka', 'Tarcza'],
        price: '250 PLN'
    },
    {
        id: 'maciej-bis',
        name: 'Maciej Bis',
        location: 'Kłodzko',
        title: 'Trener',
        imagePosition: 'top',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2026/01/Maciej-Bis.png',
        description: 'Trener boksu szkolący się u najlepszych w Polsce. Specjalizuje się w solidnych podstawach dla początkujących oraz zaawansowanej pracy ringowej. Założyciel „Wambierzycki Boxing Klub”.',
        specialties: ['Podstawy', 'Rekreacja', 'Fitness'],
        price: '150 PLN'
    },
    {
        id: 'mateusz-pawlak',
        name: 'Mateusz Pawlak',
        location: 'Warszawa',
        title: 'Trener',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2024/11/mateusz-pawlak1.jpg',
        description: 'Wielokrotny medalista mistrzostw Polski z ponad 10-letnim doświadczeniem. Szlifował warsztat u Raubo, Kosedowskiego i Zegana. Pracuje zarówno z młodzieżą, jak i pasjonatami boksu.',
        specialties: ['Trening Funkcjonalny', 'Boks dla Każdego'],
        price: '130 PLN'
    },
    {
        id: 'pawel-pokorski',
        name: 'Paweł Pokorski',
        location: 'Płock',
        title: 'Trener',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2025/11/Pawel-Pokorski.png',
        description: '15 lat doświadczenia w sportach walki (Wushu, Sanda, Kickboxing, Boks). Certyfikowany trener II klasy PZB. Kładzie nacisk na technikę, świadomość ruchu i konsekwentny rozwój.',
        specialties: ['Kondycja', 'Siła', 'Wszechstronność'],
        price: '200 PLN'
    },
    {
        id: 'pawel-worobiej',
        name: 'Paweł Worobiej',
        location: 'Kraków',
        title: 'Trener',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2024/12/Projekt-bez-nazwy.svg',
        description: 'Trener z wieloletnim doświadczeniem. Swoją wiedzę opiera na publikacjach naukowych o metodyce nauczania boksu. Skupia się na technice i poprawnym ruchu.',
        specialties: ['Technika', 'Nauka Ruchu'],
        price: '150 PLN'
    },
    {
        id: 'przemek-buchacz',
        name: 'Przemek Buchacz',
        location: 'Małopolska',
        title: 'Trener',
        imagePosition: 'top',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2025/10/Przemyslaw-Buchacz.png',
        description: 'Zawodnik boksu olimpijskiego z 9-letnim stażem. Vicemistrz Małopolski. Kładzie nacisk na poprawną technikę, świadomość ruchu i solidne podstawy. Pracuje z początkującymi i zaawansowanymi.',
        specialties: ['Nowoczesny Boks', 'Mobilność'],
        price: '120 PLN'
    },
    {
        id: 'szymon-miskiewicz',
        name: 'Szymon Miśkiewicz',
        location: 'Łódź',
        title: 'Trener',
        imagePosition: 'top',
        image: 'https://treningibokserskie.pl/wp-content/uploads/2025/11/Szymon-Miskiewicz.png',
        description: 'Aktywny zawodnik startujący na galach i turniejach. Nieustannie się szkoli na obozach w Polsce. Oferuje treningi dla wszystkich, niezależnie od poziomu zaawansowania i kondycji.',
        specialties: ['Detale', 'Bezpieczeństwo'],
        price: '160 PLN'
    }
];

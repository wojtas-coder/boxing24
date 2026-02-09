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
        price: '200 PLN',
        calLink: import.meta.env.VITE_CAL_LINK_WOJCIECH || 'wojciech' // Fallback for dev
    },
    {
        id: 'adam-bylina',
        name: 'Adam Bylina',
        location: 'Biała Podlaska',
        title: 'Współzałożyciel UBC',
        image: adamImg,
        description: 'Współzałożyciel Underground Boxing Club. Doświadczony trener i zawodnik, ekspert od przygotowania motorycznego i siłowego. W pracy skupia się na poprawnych wzorcach ruchowych, budując fundamenty pod skuteczną walkę. Siła i sprawność to jego priorytet.',
        specialties: ['Motoryka', 'Siła', 'Wzorce Ruchowe'],
        price: '200 PLN',
        calLink: import.meta.env.VITE_CAL_LINK_ADAM || 'adam' // Fallback for dev
    }
];

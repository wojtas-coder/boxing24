ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS navigation_menu JSONB DEFAULT '[
    { "id": "1", "label": "Aktualności", "path": "/news", "color": "text-red-500" },
    { "id": "2", "label": "Kalendarz", "path": "/calendar", "children": [
        { "id": "2-1", "label": "Boks Zawodowy", "path": "/calendar?view=PRO", "color": "text-yellow-500" },
        { "id": "2-2", "label": "Boks Olimpijski / Amatorski", "path": "/calendar?view=AMATEUR", "color": "text-blue-500" }
    ]},
    { "id": "3", "label": "Oferta", "path": "/membership", "color": "text-boxing-green", "children": [
        { "id": "3-1", "label": "Online Premium", "path": "/membership", "color": "text-red-500" },
        { "id": "3-2", "label": "Treningi Personalne", "path": "/booking" }
    ]},
    { "id": "4", "label": "Wiedza", "path": "/knowledge", "children": [
        { "id": "4-1", "label": "Artykuły", "path": "/knowledge?view=articles" },
        { "id": "4-2", "label": "Kompendium", "path": "/knowledge?view=compendium" },
        { "id": "4-3", "label": "Recenzje", "path": "/knowledge?view=reviews" }
    ]},
    { "id": "5", "label": "Sklep PunchIn", "path": "/boutique" }
]';

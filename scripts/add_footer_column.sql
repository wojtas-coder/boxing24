ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS footer_menu JSONB DEFAULT '{
  "quick_links": [
    { "id": "1", "label": "Newsy", "path": "/news" },
    { "id": "2", "label": "Kalendarz", "path": "/calendar" },
    { "id": "3", "label": "Rezerwacja", "path": "/booking" },
    { "id": "4", "label": "Wiedza", "path": "/knowledge" },
    { "id": "5", "label": "Członkostwo", "path": "/membership" },
    { "id": "6", "label": "Sklep", "path": "/boutique" }
  ],
  "bottom_links": [
    { "id": "b1", "label": "Polityka Prywatności", "path": "/privacy" },
    { "id": "b2", "label": "Regulamin", "path": "/terms" }
  ]
}';

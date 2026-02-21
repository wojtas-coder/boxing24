import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const SettingsContext = createContext({});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        company_name: 'Boxing24 Sp. z o.o.',
        company_nip: '8970000000',
        contact_email: 'kontakt@boxing24.pl',
        contact_phone: '+48 500 000 000',
        address_street: 'ul. Przykładowa 1',
        address_postal: '50-000',
        address_city: 'Wrocław',
        business_hours: 'Pon-Pt 06:00 - 22:00',
        seo_title_suffix: ' | Boxing24 - Elite Performance',
        seo_default_description: 'Profesjonalne centrum testów i przygotowania motorycznego',
        seo_default_og_image: '',
        social_instagram: 'https://instagram.com/boxing24',
        social_facebook: 'https://facebook.com/boxing24',
        social_youtube: 'https://youtube.com/@Boxing24_pl',
        social_tiktok: '',
        social_x: '',
        brand_logo_url: '',
        brand_favicon_url: '',
        color_primary: '#dc2626',
        color_secondary: '#22c55e',
        analytics_ga4_id: '',
        meta_pixel_id: '',
        is_maintenance_mode: false,
        is_registration_open: true,
        is_booking_active: true
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Try fetching from localStorage first for instant boot (optional layer)
                const cached = localStorage.getItem('boxing24_site_settings');
                if (cached) {
                    setSettings(JSON.parse(cached));
                }

                // Fetch fresh from Supabase
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('*')
                    .eq('id', 1)
                    .single();

                if (!error && data) {
                    setSettings(data);
                    localStorage.setItem('boxing24_site_settings', JSON.stringify(data));
                }
            } catch (err) {
                console.error("Failed to load global settings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Provide default fallbacks if missing
    return (
        <SettingsContext.Provider value={{ settings, loading }}>
            {/* If maintenance mode is ON and we're not an admin going to /admin, we could block it here. But for now we just provide data. */}
            {children}
        </SettingsContext.Provider>
    );
};

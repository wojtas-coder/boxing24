import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useAnalytics = () => {
    const location = useLocation();
    const { user } = useAuth();
    const initialized = useRef(false);

    useEffect(() => {
        const trackPageView = async () => {
            try {
                await supabase.from('analytics_events').insert([{
                    event_type: 'page_view',
                    page_path: location.pathname,
                    user_id: user?.id || null,
                    metadata: {
                        referrer: document.referrer,
                        screen_width: window.innerWidth
                    }
                }]);
            } catch (err) {
                // Fail silently to not impact UX
                console.warn('Analytics error:', err);
            }
        };

        trackPageView();
    }, [location.pathname, user?.id]);

    const trackEvent = async (eventType, metadata = {}) => {
        try {
            await supabase.from('analytics_events').insert([{
                event_type: eventType,
                page_path: window.location.pathname,
                user_id: user?.id || null,
                metadata
            }]);
        } catch (err) {
            console.warn('Analytics error:', err);
        }
    };

    return { trackEvent };
};

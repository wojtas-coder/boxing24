import React, { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { Loader2 } from "lucide-react";

/**
 * BookingCalendar Component
 * Wraps @calcom/embed-react to display a specific user's calendar.
 * 
 * @param {string} calLink - The Cal.com link identifier (e.g., "username" or "username/event")
 * @param {function} onBookingSuccess - Callback when booking is completed
 */
const BookingCalendar = ({ calLink, onBookingSuccess }) => {

    useEffect(() => {
        (async function () {
            const cal = await getCalApi();

            // Global UI Config
            cal("ui", {
                theme: "dark",
                styles: {
                    branding: {
                        brandColor: "#22c55e" // boxing-green
                    }
                },
                hideEventTypeDetails: false,
                layout: "month_view",
            });

            // Event Listeners
            cal("on", {
                action: "bookingSuccessful",
                callback: (e) => {
                    console.log("Cal.com Booking Success:", e);
                    if (onBookingSuccess) onBookingSuccess(e);
                },
            });
        })();
    }, [onBookingSuccess]);

    if (!calLink) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center border border-zinc-800 rounded-2xl bg-zinc-900/50 text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-boxing-green" />
                <p className="text-xs uppercase font-bold tracking-widest">Ładowanie kalendarza...</p>
                <p className="text-[10px] opacity-50 mt-2">Jeśli to trwa zbyt długo, sprawdź konfigurację linku Cal.com.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[700px] bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative animate-in fade-in duration-700">
            {/* Gradient behind */}
            <div className="absolute inset-0 bg-gradient-to-br from-boxing-green/5 to-transparent pointer-events-none"></div>

            <Cal
                calLink={calLink}
                style={{ width: "100%", height: "100%", minHeight: "700px", overflow: "scroll" }}
                config={{
                    layout: "month_view",
                    theme: "dark"
                }}
            />
        </div>
    );
};

export default BookingCalendar;

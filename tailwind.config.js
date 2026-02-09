/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                boxing: {
                    green: '#22c55e', // Vibrant Green (Unified)
                    neon: '#ccff00',  // High-Voltage Lime (2026 Trend)
                    gold: '#d4af37',  // Premium Accent
                    dark: '#09090b',  // Zinc 950
                    light: '#fafafa', // Zinc 50
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}

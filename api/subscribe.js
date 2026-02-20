import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use Service Role to bypass RLS, or Anon Key if Service Role is not available
const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Brak adresu e-mail.' });
        }

        // 1. Zapisz do Supabase
        const { error: dbError } = await supabaseAdmin
            .from('subscribers')
            .insert([{ email }]);

        if (dbError) {
            if (dbError.code === '23505') {
                // Ignore duplicate error if they are just trying to subscribe again, 
                // but we can choose whether to send the welcome email again. Let's send it or just return success.
                return res.status(200).json({ message: 'Ten e-mail jest już zapisany.', duplicate: true });
            } else {
                throw dbError;
            }
        }

        // 2. Wyślij POWITALNY E-MAIL przez Resend
        const welcomeHtml = `
            <div style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 40px 20px; text-align: center;">
                <h1 style="color: #dc2626; font-style: italic; text-transform: uppercase; font-size: 32px; margin-bottom: 10px;">
                    🥊 WITAJ W BOXING<span style="color: #22c55e;">24</span> INSIDE
                </h1>
                <p style="color: #a1a1aa; font-size: 16px; max-width: 500px; margin: 0 auto 30px; line-height: 1.6;">
                    Dziękujemy za dołączenie do naszego newslettera! Od teraz będziesz jako pierwszy dowiadywać się o naszych nowych analizach, warsztatach i specjalnych wydarzeniach.
                </p>
                <div style="background-color: #18181b; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; margin-bottom: 30px; border: 1px solid #27272a;">
                    <h3 style="color: #fff; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; margin-bottom: 15px;">Co zyskujesz?</h3>
                    <ul style="text-align: left; color: #d4d4d8; font-size: 14px; line-height: 1.8; list-style-type: none; padding: 0;">
                        <li>🔥 Wcześniejszy dostęp do zapisów na campy</li>
                        <li>📊 Darmowe fragmenty wiedzy o biomechanice ciosu</li>
                        <li>🎁 Ekskluzywne zniżki na nasz sprzęt odzieżowy</li>
                    </ul>
                </div>
                <p style="color: #52525b; font-size: 12px; margin-top: 40px;">
                    Nie zgaduj. Trenuj na danych.<br/>
                    Zespół Boxing24
                </p>
            </div>
        `;

        const { error: emailError } = await resend.emails.send({
            from: 'Boxing24 <biuro@boxing24.pl>',
            to: [email],
            subject: 'Witamy w Boxing24 Inside! 🥊',
            html: welcomeHtml,
        });

        if (emailError) {
            console.error('Błąd wysyłki Resend (Prawdopodobnie brak weryfikacji domeny):', emailError);
            // Zwracamy success, bo zapis do bazy się udał
        }

        return res.status(200).json({ success: true, message: 'Dziękujemy! Zostałeś zapisany do newslettera.' });
    } catch (error) {
        console.error('Newsletter Signup API Error:', error);
        return res.status(500).json({ error: 'Wystąpił błąd podczas zapisu. Spróbuj ponownie później.' });
    }
}

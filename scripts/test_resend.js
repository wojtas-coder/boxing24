import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
    console.log('Testing Resend API...');

    // First, let's try with the branded email
    console.log('Attempting to send from biuro@boxing24.pl...');
    const result1 = await resend.emails.send({
        from: 'Boxing24 <biuro@boxing24.pl>',
        to: ['treningiboxing24@gmail.com'], // using an email we know is in the user's db as a test receiver
        subject: 'Witaj w Boxing24 Inside! 🥊 (Test 1)',
        html: '<p>Test 1 z biuro@boxing24.pl</p>'
    });

    console.log('Result 1:', JSON.stringify(result1, null, 2));

    // Next, let's try with the default testing email if it failed
    if (result1.error) {
        console.log('\nTesting with onboarding@resend.dev...');
        const result2 = await resend.emails.send({
            from: 'Boxing24 <onboarding@resend.dev>',
            to: ['treningiboxing24@gmail.com'],
            subject: 'Witaj w Boxing24 Inside! 🥊 (Test 2)',
            html: '<p>Test 2 z onboarding@resend.dev</p>'
        });
        console.log('Result 2:', JSON.stringify(result2, null, 2));
    }
}

testResend();

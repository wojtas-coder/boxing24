
import fetch from 'node-fetch';

const URL = 'https://boxing24.pl/login';
// Also try the Vercel app directly if aliasing is slow
const URL_VERCEL = 'https://boxing24-landing-5o20fwhte-wojos-projects-df0ede17.vercel.app/login';

async function checkDeployment() {
    console.log(`Checking ${URL}...`);
    try {
        const res = await fetch(URL, { headers: { 'Cache-Control': 'no-cache' } });
        const html = await res.text();

        const hasGoogle = html.includes('Google') || html.includes('Chrome');
        const hasFacebook = html.includes('Facebook');
        const hasMagicLink = html.includes('Magic Link');

        console.log('--- DIAGNOSTICS ---');
        console.log('Contains "Google":', hasGoogle);
        console.log('Contains "Facebook":', hasFacebook);
        console.log('Contains "Magic Link":', hasMagicLink);

        if (hasGoogle || hasFacebook) {
            console.log('SUCCESS: Deployed version has Social Auth.');
        } else {
            console.log('FAILURE: Deployed version seems old.');
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

checkDeployment();

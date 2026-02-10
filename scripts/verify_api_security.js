
import fetch from 'node-fetch';

const API_URL = 'https://boxing24.pl/api/client-data';

async function checkSecurity() {
    console.log(`Checking Security for ${API_URL}...`);
    try {
        // 1. Request without Token
        console.log('Test 1: Request with NO token...');
        const resNoToken = await fetch(API_URL);

        if (resNoToken.status === 401) {
            console.log('✅ PASS: API correctly rejected request without token (401).');
        } else {
            console.error(`❌ FAIL: API allowed request without token! Status: ${resNoToken.status}`);
        }

        // 2. Request with Fake Token
        console.log('Test 2: Request with FAKE token...');
        const resFakeToken = await fetch(API_URL, {
            headers: { 'Authorization': 'Bearer fake-token-123' }
        });

        if (resFakeToken.status === 401) {
            console.log('✅ PASS: API correctly rejected fake token (401).');
        } else {
            console.error(`❌ FAIL: API allowed fake token! Status: ${resFakeToken.status}`);
        }

    } catch (e) {
        console.error('Fetch error:', e);
    }
}

checkSecurity();

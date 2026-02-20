import puppeteer from 'puppeteer';

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER EXCEPTION:', err.toString()));
        page.on('requestfailed', request => console.log('REQ FAILED:', request.url(), request.failure().errorText));

        console.log('Navigating to live site...');
        await page.goto('https://boxing24.pl/admin/email', { waitUntil: 'networkidle2', timeout: 30000 });

        await new Promise(r => setTimeout(r, 2000));

        console.log('Done.');
        await browser.close();
    } catch (e) {
        console.error('Puppeteer Script Error:', e);
    }
})();

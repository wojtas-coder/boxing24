
export const sendSMS = async (to, message) => {
    const token = process.env.SMSAPI_OAUTH_TOKEN;
    if (!token) {
        console.warn('SMSAPI_OAUTH_TOKEN not set. SMS skipped.');
        return false;
    }

    try {
        const params = new URLSearchParams({
            to: to,
            message: message,
            format: 'json'
            // from: 'Info' // Optional: requires sender name registration
        });

        const response = await fetch('https://api.smsapi.pl/sms.do', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: params
        });

        const data = await response.json();

        if (data.error) {
            console.error('SMSAPI Error:', data.error);
            return false;
        }

        console.log(`SMS Sent to ${to}: ${message}`);
        return true;

    } catch (error) {
        console.error('SMS Send Failed:', error);
        return false;
    }
};

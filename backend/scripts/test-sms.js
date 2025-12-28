import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from backend root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

// REPACE THIS WITH YOUR TESTING PHONE NUMBER (e.g. '+15551234567')
const TO_PHONE_NUMBER = '+14164559844';

async function testSMS() {
    console.log('--- Testing Twilio SMS ---');
    console.log('SID:', accountSid ? 'Found' : 'Missing');
    console.log('Token:', authToken ? 'Found' : 'Missing');
    console.log('From:', fromPhone);
    console.log('To:', TO_PHONE_NUMBER);

    if (!accountSid || !authToken || !fromPhone) {
        console.error('ERROR: Missing environment variables. Check your .env file.');
        return;
    }

    const client = twilio(accountSid, authToken);

    try {
        console.log('Sending...');
        const message = await client.messages.create({
            body: '【有福家】这是一条测试短信。This is a test message from Youfujia Backend.',
            from: fromPhone,
            to: TO_PHONE_NUMBER
        });
        console.log('✅ SMS Sent Successfully!');
        console.log('Message SID:', message.sid);
    } catch (error) {
        console.error('❌ Send Failed:', error.message);
        console.error('Code:', error.code);
        console.error('More Info:', error.moreInfo);
    }
}

testSMS();

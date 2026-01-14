// Test SMS sending
import { sendSMS } from '../src/services/smsService.js';

async function test() {
    console.log('Testing SMS to 4164559844...');
    const result = await sendSMS('4164559844', 'Test SMS from Fongbee: checking SMS delivery');
    console.log('Result:', result);
}

test().catch(e => console.error('Error:', e));

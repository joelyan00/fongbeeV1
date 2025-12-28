import dotenv from 'dotenv';
import { sendTemplateSMS } from '../src/services/smsService.js';

dotenv.config();

// Use hardcoded values for testing
const TO_PHONE = process.env.TO_PHONE_NUMBER || '+14164559844'; // Verified number
const TEMPLATE_KEY = 'provider_invite';

const mockData = {
    userName: 'Tester_' + Math.floor(Math.random() * 1000),
    serviceName: 'House Cleaning',
    details: '(Tomorrow / 123 Main St)',
    link: 'https://test.link/123'
};

console.log(`Sending '${TEMPLATE_KEY}' SMS to ${TO_PHONE}...`);
console.log('Data:', mockData);

sendTemplateSMS(TO_PHONE, TEMPLATE_KEY, mockData)
    .then(result => {
        if (result.success) {
            console.log('\n✅ SMS Sent Successfully!');
            console.log('SID:', result.sid);
            // Note: sendTemplateSMS/sendSMS only returns SID, not the body content directly in response
        } else {
            console.error('\n❌ SMS Failed:', result.error);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Unexpected Error:', err);
        process.exit(1);
    });

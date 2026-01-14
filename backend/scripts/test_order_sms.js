// Test order-like SMS
import { sendSMS } from '../src/services/smsService.js';

async function test() {
    const msg = '【优服佳】您有新订单！服务:多伦多机场接机，金额$150。48小时内请响应，查看详情：https://h5.fongbee.com/test';
    console.log('Testing order-like SMS...');
    console.log('Message:', msg);
    const result = await sendSMS('4164559844', msg);
    console.log('Result:', result);
}

test().catch(e => console.error('Error:', e));

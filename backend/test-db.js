import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load env vars
dotenv.config();

console.log('\n🔍 ================== Database Connection Test ==================');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log(`Checking configuration...`);
console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`);
console.log(`SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✅ Found' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseServiceKey) {
    console.log('\n⚠️  RESULT: Running in MOCK MODE (Memory only).');
    console.log('   Data will NOT be saved to Supabase.');
    console.log('   Please check your .env file.');
} else {
    console.log('\nAttempting to connect to Supabase...');

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Try a simple query
        const { data, error, count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('\n❌ Connection Failed!');
            console.error('Error details:', error.message);
            console.log('\nPossible causes:');
            console.log('1. Invalid credentials in .env');
            console.log('2. Network issues');
            console.log('3. Database paused (check Supabase dashboard)');
        } else {
            console.log('\n✅ Connection SUCCESSFUL!');
            console.log(`   Connected to: ${supabaseUrl}`);
            console.log(`   Current Users Count: ${count}`);
            console.log('\n✅ RESULT: Running in DATABASE MODE.');
            console.log('   Your data should be saving to Supabase.');
        }

    } catch (e) {
        console.error('\n❌ Unexpected Error:', e.message);
    }
}

console.log('=============================================================\n');

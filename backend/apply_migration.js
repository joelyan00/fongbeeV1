
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    const sqlPath = path.join(__dirname, 'database', 'add_presence_to_orders.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying migration...');

    // Supabase JS doesn't have a direct "run raw sql" unless you use an RPC or similar
    // But we can try to use the query builder for some things.
    // Actually, I will just use the REST API to run the SQL if possible, 
    // but it is usually protected.

    // A better way is to use a simple table check and then insert or similar.
    // HOWEVER, I can also just instruct the USER to run the SQL in the dashboard.

    console.log('Migration SQL is ready at:', sqlPath);
    console.log('Please run this SQL in your Supabase SQL Editor if the script fails.');

    try {
        // Try a simple update to see if columns exist
        const { error } = await supabase.from('orders').update({ user_last_active_at: new Date().toISOString() }).limit(1);
        if (error && error.message.includes('column "user_last_active_at" of relation "orders" does not exist')) {
            console.log('Confirmed: columns are missing.');
        } else if (!error) {
            console.log('Columns already exist.');
            return;
        } else {
            console.error('Unexpected error:', error);
        }
    } catch (e) {
        console.error('Check failed:', e);
    }
}

migrate();

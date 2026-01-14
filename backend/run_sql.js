import { supabaseAdmin } from './src/config/supabase.js';

async function run() {
    if (!supabaseAdmin) {
        console.error('Supabase admin not configured');
        return;
    }

    // Note: pgml or other extensions might not be enabled, so we might need to use a direct query if possible.
    // However, supabase-js doesn't support direct SQL unless there's an RPC.
    // If no RPC, we'll try to use the CLI in a different way.

    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
        sql_string: "ALTER TABLE order_reviews ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';"
    });

    if (error) {
        console.error('Error executing SQL via RPC:', error);
    } else {
        console.log('SQL executed successfully:', data);
    }
}

run();

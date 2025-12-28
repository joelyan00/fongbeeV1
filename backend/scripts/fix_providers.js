import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    console.error('Expected: SUPABASE_URL and SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log('Starting provider status fix...');

    // 1. Get all users with at least one approved application
    const { data: apps, error } = await supabase
        .from('service_type_applications')
        .select('user_id')
        .eq('status', 'approved');

    if (error) {
        console.error('Error fetching applications:', error);
        return;
    }

    if (!apps || apps.length === 0) {
        console.log('No approved applications found.');
        return;
    }

    // Unique users
    const userIds = [...new Set(apps.map(a => a.user_id))];
    console.log(`Found ${userIds.length} users with approved applications.`);

    for (const userId of userIds) {
        console.log(`Processing User ID: ${userId}`);

        // Update Provider Profile
        const { error: profileError } = await supabase
            .from('provider_profiles')
            .update({ status: 'approved' })
            .eq('user_id', userId);

        if (profileError) console.error(`  Failed to update profile for ${userId}:`, profileError.message);
        else console.log(`  Updated profile status to approved.`);

        // Update User Role
        const { error: userError } = await supabase
            .from('users')
            .update({ role: 'provider' })
            .eq('id', userId);

        if (userError) console.error(`  Failed to update user role for ${userId}:`, userError.message);
        else console.log(`  Updated user role to provider.`);
    }

    console.log('Fix completed.');
}

fix();

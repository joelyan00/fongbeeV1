const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' }); // Adjusted path

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProviderServices() {
    console.log('Checking provider_services table...');
    const { data, error } = await supabase
        .from('provider_services')
        .select('id, title, category, category_id, status, provider_id');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Found services:', data.length);
        data.forEach(s => {
            console.log(`[${s.status}] ID: ${s.id}, Title: ${s.title}, Category: "${s.category}", CatID: "${s.category_id}"`);
        });
    }
}

checkProviderServices();

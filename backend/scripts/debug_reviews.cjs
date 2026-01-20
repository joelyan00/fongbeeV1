const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Corrected from .env

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectReviews() {
    console.log('--- Inspecting order_reviews ---');
    const { data: reviews, error } = await supabase
        .from('order_reviews')
        .select(`
            *,
            orders(
                order_no,
                provider_id,
                user_id,
                provider_services(title)
            )
        `)
        .limit(10);

    if (error) {
        console.error('Error fetching reviews:', error);
        return;
    }

    console.log(`Found ${reviews ? reviews.length : 0} recent reviews.`);
    reviews.forEach(r => {
        console.log(`ID: ${r.id}`);
        console.log(`Comment: ${r.comment}`);
        console.log(`Rating: ${r.rating}`);
        console.log(`Provider ID (in review): ${r.provider_id}`);
        console.log(`Provider ID (in order): ${r.orders?.provider_id}`);
        console.log(`Service: ${r.orders?.provider_services?.title}`);
        console.log('---');
    });

    console.log('\n--- Searching for Provider: joelyan@gmail.com ---');
    const { data: provider, error: pErr } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', 'joelyan@gmail.com')
        .single();

    if (pErr) {
        console.error('Error finding provider:', pErr);
    } else {
        console.log('Provider Info:', provider);

        const { count, error: cErr } = await supabase
            .from('order_reviews')
            .select('*', { count: 'exact', head: true })
            .eq('provider_id', provider.id);

        if (cErr) console.error('Error counting reviews:', cErr);
        else console.log(`Count of reviews for this provider: ${count}`);

        // Also check if any reviews have this provider ID in the order but not in the review
        const { data: missReviews, error: mErr } = await supabase
            .from('order_reviews')
            .select('*, orders!inner(*)')
            .eq('orders.provider_id', provider.id);

        if (mErr) console.error('Error checking nested provider reviews:', mErr);
        else console.log(`Reviews linked via order provider_id: ${missReviews ? missReviews.length : 0}`);
    }
}

inspectReviews();

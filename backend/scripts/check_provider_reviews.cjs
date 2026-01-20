const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProviderReviews() {
    const email = 'joelyan@gmail.com';
    console.log(`Checking for user with email: ${email}`);

    const { data: user, error: uErr } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', email)
        .single();

    if (uErr) {
        console.error('Error finding user:', uErr);
        return;
    }
    console.log('User found:', user);

    console.log('\n--- Checking order_reviews for this provider_id ---');
    const { data: reviews, error: rErr } = await supabase
        .from('order_reviews')
        .select('*')
        .eq('provider_id', user.id);

    if (rErr) {
        console.error('Error fetching reviews:', rErr);
    } else {
        console.log(`Found ${reviews.length} reviews directly linked to this provider_id.`);
        reviews.forEach(r => console.log(`- Review ID: ${r.id}, Rating: ${r.rating}, Comment: ${r.comment}`));
    }

    console.log('\n--- Checking orders for this provider_id ---');
    const { data: orders, error: oErr } = await supabase
        .from('orders')
        .select('id, order_no, status, user_id')
        .eq('provider_id', user.id);

    if (oErr) {
        console.error('Error fetching orders:', oErr);
    } else {
        console.log(`Found ${orders.length} orders where this user is the provider.`);
        const orderIds = orders.map(o => o.id);

        if (orderIds.length > 0) {
            console.log('\n--- Checking reviews for these orders ---');
            const { data: reviewsByOrder, error: roErr } = await supabase
                .from('order_reviews')
                .select('*')
                .in('order_id', orderIds);

            if (roErr) {
                console.error('Error fetching reviews by order:', roErr);
            } else {
                console.log(`Found ${reviewsByOrder.length} reviews linked to these orders.`);
                reviewsByOrder.forEach(r => {
                    console.log(`- Review ID: ${r.id}, Order ID: ${r.order_id}, Provider ID in review: ${r.provider_id}`);
                    if (r.provider_id !== user.id) {
                        console.log(`  WARNING: Provider ID mismatch! Review has ${r.provider_id}, but user is ${user.id}`);
                    }
                });
            }
        }
    }
}

checkProviderReviews();

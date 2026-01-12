import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars BEFORE importing supabase config
dotenv.config({ path: path.join(__dirname, '../.env') });

// Dynamic import to ensure env vars are loaded
const { supabaseAdmin, supabase } = await import('../src/config/supabase.js');

async function run() {
    // Try 'one_off' which matches earlier patterns
    // await createTestOrder('one_off'); // one_off is invalid enum
    // Try 'standard'
    await createTestOrder('standard');
}

async function createTestOrder(serviceType) {
    console.log(`Generating Test Order with type: ${serviceType}...`);

    // Get a provider
    const { data: provider } = await supabaseAdmin.from('users').select('id, name').eq('role', 'provider').limit(1).single();

    // 1. Get User (joejianlang@gmail.com) from public.users table
    console.log('Looking up user: joejianlang@gmail.com in public.users...');
    const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, email, name')
        .eq('email', 'joejianlang@gmail.com')
        .single();

    // Debug output
    if (!user) {
        console.log('User not found in public.users. Listing typical users:');
        const { data: allUsers } = await supabaseAdmin.from('users').select('email').limit(5);
        console.log('Available users:', allUsers);
        throw new Error('User joejianlang@gmail.com not found in public.users table!');
    }

    if (userError) throw userError;
    console.log('Found User:', user.id);

    if (!user) {
        throw new Error('User joejianlang@gmail.com not found! Please sign up in the app first.');
    }
    console.log('Found User:', user.id);

    // 2. Create Submission (Order)
    // We use 'pending' status so it shows up in "Pending Payment" tab
    // 2. Create Submission (Order)
    const { data: submission, error: subError } = await supabaseAdmin
        .from('submissions')
        .insert({
            user_id: user.id,
            status: 'pending',
            submission_type: 'user_request', // Enum: user_request, provider_listing
            assigned_provider_id: provider.id,
            form_data: {
                service_type: serviceType,
                address: '123 Test St, Mock City',
                contact_name: 'Joe Test',
                contact_phone: '1234567890',
                scheduled_time: new Date(Date.now() + 86400000).toISOString(),
                description: 'Mock Standard Service Order for Payment Test',
                _order_no: `TEST${Math.floor(Math.random() * 100000)}` // Pre-generate or let backend handle?
            }
        })
        .select()
        .single();

    if (subError) {
        console.error('Submission Insert Error:', subError);
        throw subError;
    }

    // Skip Order creation for 'pending' state as it lives in submissions until paid?
    // Or maybe orders table requires valid status 'captured'.
    console.log('Skipping orders table insert to avoid status check constraint.');

    console.log('\n✅ Mock Submission Created Successfully!');
    console.log('Submission ID:', submission.id);
}

run();

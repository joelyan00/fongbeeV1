
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function check() {
    console.log('Checking System Pricing Config...');
    const { data: config, error: configError } = await supabase
        .from('system_pricing_config')
        .select('config_key, config_value');

    if (configError) console.error('Config Error:', configError);
    else console.table(config);

    console.log('\nChecking Subscription Plans...');
    const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('name, tier, price_monthly, price_yearly')
        .order('sort_order');

    if (plansError) console.error('Plans Error:', plansError);
    else console.table(plans);
}

check();

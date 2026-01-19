
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function syncSubscriptionPlanConfig(key, value) {
    try {
        const parts = key.split('_');
        if (parts[0] !== 'sub') return;

        let tier = '';
        let targetName = '';
        if (key.includes('basic')) {
            tier = 'basic';
            targetName = '初级会员';
        } else if (key.includes('premium')) {
            tier = 'professional';
            targetName = '高级会员';
        } else if (key.includes('vip')) {
            tier = 'premium';
            targetName = 'VIP会员';
        }

        if (!tier) return;

        const updates = {};
        if (key.endsWith('monthly_price')) {
            const val = parseFloat(value);
            if (!isNaN(val)) updates.price_monthly = val;
        } else if (key.endsWith('yearly_price')) {
            const val = parseFloat(value);
            if (!isNaN(val)) updates.price_yearly = val;
        } else if (key.endsWith('monthly_credits')) {
            const val = parseInt(value);
            if (!isNaN(val)) updates.included_credits = val;
        } else if (key.endsWith('listing_quota')) {
            const val = parseInt(value);
            if (!isNaN(val)) updates.included_standard_listings = val;
        }

        // Always include name to sync it as well
        if (targetName) updates.name = targetName;

        if (Object.keys(updates).length > 0) {
            console.log(`[Sync] Attempting to update tier ${tier} (${key}) with:`, JSON.stringify(updates));
            const { data, error } = await supabase
                .from('subscription_plans')
                .update(updates)
                .eq('tier', tier)
                .select();

            if (error) {
                console.error(`[Sync] Error updating tier ${tier}:`, error);
            } else {
                console.log(`[Sync] Successfully updated tier ${tier}. Rows affected: ${data?.length || 0}`);
            }
        }
    } catch (err) {
        console.error('Sync to subscription_plans failed:', err);
    }
}

async function runForceSync() {
    console.log('Fetching system config...');
    const { data: configs, error } = await supabase
        .from('system_pricing_config')
        .select('*')
        .like('config_key', 'sub_%');

    if (error) {
        console.error('Failed to fetch config:', error);
        return;
    }

    console.log(`Found ${configs.length} configs to sync.`);

    for (const config of configs) {
        await syncSubscriptionPlanConfig(config.config_key, config.config_value);
    }
}

runForceSync();

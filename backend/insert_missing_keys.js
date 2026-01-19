
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const missingKeys = [
    { config_key: 'sub_basic_yearly_price', config_value: '299.99', config_type: 'number', description: '初级会员年费', category: 'subscription' },
    { config_key: 'sub_basic_listing_quota', config_value: '5', config_type: 'number', description: '初级会员每月上架数', category: 'subscription' },
    { config_key: 'sub_premium_yearly_price', config_value: '999.99', config_type: 'number', description: '高级会员年费', category: 'subscription' },
    { config_key: 'sub_premium_listing_quota', config_value: '20', config_type: 'number', description: '高级会员每月上架数', category: 'subscription' },
    { config_key: 'sub_vip_yearly_price', config_value: '2999.99', config_type: 'number', description: 'VIP会员年费', category: 'subscription' },
    { config_key: 'sub_vip_listing_quota', config_value: '100', config_type: 'number', description: 'VIP会员每月上架数', category: 'subscription' }
];

async function insertKeys() {
    console.log('Inserting missing keys...');

    for (const key of missingKeys) {
        const { error } = await supabase
            .from('system_pricing_config')
            .upsert(key, { onConflict: 'config_key' });

        if (error) console.error(`Failed to insert ${key.config_key}:`, error);
        else console.log(`Inserted/Updated ${key.config_key}`);
    }
}

insertKeys();

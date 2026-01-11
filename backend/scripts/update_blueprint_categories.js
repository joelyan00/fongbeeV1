// Simple script to add service_category to existing blueprints
import { supabaseAdmin } from '../src/config/supabase.js';

async function updateBlueprints() {
    console.log('Updating blueprints with service_category...');

    try {
        // Get all blueprints
        const { data: blueprints, error: fetchError } = await supabaseAdmin
            .from('service_blueprints')
            .select('id, name');

        if (fetchError) throw fetchError;

        console.log(`Found ${blueprints?.length || 0} blueprints`);

        if (blueprints && blueprints.length > 0) {
            for (const blueprint of blueprints) {
                let category = null;

                if (blueprint.name.includes('清洁')) {
                    category = '清洁服务';
                } else if (blueprint.name.includes('搬家')) {
                    category = '搬家服务';
                } else {
                    console.log(`⚠️  Skipping "${blueprint.name}" - no matching category`);
                    continue;
                }

                const { error: updateError } = await supabaseAdmin
                    .from('service_blueprints')
                    .update({ service_category: category })
                    .eq('id', blueprint.id);

                if (updateError) {
                    console.error(`❌ Error updating blueprint ${blueprint.id}:`, updateError);
                } else {
                    console.log(`✓ Updated "${blueprint.name}" → ${category}`);
                }
            }
        }

        // Verify changes
        const { data: updated, error: verifyError } = await supabaseAdmin
            .from('service_blueprints')
            .select('id, name, category, service_category, status');

        if (verifyError) throw verifyError;

        console.log('\n✅ Update completed successfully!');
        console.log('\nBlueprints:');
        console.table(updated);

    } catch (error) {
        console.error('❌ Update failed:', error);
        process.exit(1);
    }
}

updateBlueprints();

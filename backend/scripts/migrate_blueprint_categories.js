// Script to add service_category field to service_blueprints table
import { supabaseAdmin } from '../src/config/supabase.js';

async function migrate() {
    console.log('Starting migration: Add service_category to service_blueprints...');

    try {
        // Execute SQL migration
        const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
            sql: `
                -- Add service_category column
                ALTER TABLE service_blueprints 
                ADD COLUMN IF NOT EXISTS service_category VARCHAR(100);

                -- Add index for performance
                CREATE INDEX IF NOT EXISTS idx_blueprints_service_category 
                ON service_blueprints(service_category);
            `
        });

        if (alterError) {
            console.error('Error adding column:', alterError);
            // Continue anyway, column might already exist
        } else {
            console.log('✓ Added service_category column and index');
        }

        // Update existing blueprints
        const { data: blueprints, error: fetchError } = await supabaseAdmin
            .from('service_blueprints')
            .select('id, name, service_category')
            .is('service_category', null);

        if (fetchError) throw fetchError;

        console.log(`Found ${blueprints?.length || 0} blueprints without service_category`);

        if (blueprints && blueprints.length > 0) {
            for (const blueprint of blueprints) {
                let category = null;

                if (blueprint.name.includes('清洁')) {
                    category = '清洁服务';
                } else if (blueprint.name.includes('搬家')) {
                    category = '搬家服务';
                }

                if (category) {
                    const { error: updateError } = await supabaseAdmin
                        .from('service_blueprints')
                        .update({ service_category: category })
                        .eq('id', blueprint.id);

                    if (updateError) {
                        console.error(`Error updating blueprint ${blueprint.id}:`, updateError);
                    } else {
                        console.log(`✓ Updated "${blueprint.name}" → ${category}`);
                    }
                }
            }
        }

        // Verify changes
        const { data: updated, error: verifyError } = await supabaseAdmin
            .from('service_blueprints')
            .select('id, name, category, service_category, status')
            .eq('status', 'published');

        if (verifyError) throw verifyError;

        console.log('\n✅ Migration completed successfully!');
        console.log('\nPublished blueprints:');
        console.table(updated);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();

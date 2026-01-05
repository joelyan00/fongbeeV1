import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const router = express.Router();

// GET /api/services/offerings - Public endpoint to get approved provider listings
router.get('/offerings', async (req, res) => {
    try {
        if (!isSupabaseConfigured()) {
            return res.json({ services: [] });
        }

        // 1. Fetch Approved Provider Listings
        // Join with form_templates to get template name if needed (optional if we trust form_data)
        // Join with users (provider) to get name/avatar

        let query = supabaseAdmin
            .from('submissions')
            .select(`
                id,
                template_id,
                form_data,
                provider_id,
                created_at,
                provider:provider_id (
                    id,
                    name,
                    avatar
                )
            `)
            .eq('submission_type', 'provider_listing')
            .eq('listing_status', 'approved');

        const { data: listings, error } = await query;

        if (error) throw error;

        // 2. Transform Data
        const services = listings.map(item => {
            const formData = item.form_data || {};

            // Extract Price
            let price = formData.price || '0';
            // Handle currency symbol if stored in string (e.g. "$100"), otherwise default to ¥/$/etc based on assumption or other fields
            // Assuming simplified display for now

            // Extract Images (first one)
            let image = null;
            // Iterate keys to find image array or string
            for (const key in formData) {
                if (key.includes('image') || key === 'photos' || key === 'picture') {
                    const val = formData[key];
                    if (Array.isArray(val) && val.length > 0) image = val[0];
                    else if (typeof val === 'string' && val.startsWith('data:image')) image = val;
                }
            }
            // Fallback: If no explicit image key found, look for any base64/url string
            if (!image) {
                const vals = Object.values(formData);
                const imgVal = vals.find(v => typeof v === 'string' && (v.startsWith('data:image') || v.startsWith('http')));
                if (imgVal) image = imgVal;
            }

            // Extract Description
            const description = formData.description || formData.details || '';

            // Extract Category (from form_data or we need to join form_templates)
            // Ideally we stored category_name in form_data during creation
            const category = formData.category_name || formData.category || 'Standard Service';

            return {
                id: item.id,
                templateId: item.template_id,
                title: formData.title || 'Untitled Service',
                price: price,
                unit: formData.unit || '次', // visit/hour/etc
                description: description,
                image: image, // Frontend should handle fallback
                category: category,
                provider: {
                    id: item.provider?.id,
                    name: item.provider?.name,
                    avatar: item.provider?.avatar
                }
            };
        });

        res.json({ services });
    } catch (error) {
        console.error('Get service offerings error:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

export default router;

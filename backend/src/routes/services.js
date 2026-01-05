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
        // Note: We avoid nested selects to handle potential NULL provider_id in legacy data
        let query = supabaseAdmin
            .from('submissions')
            .select(`
                id,
                template_id,
                form_data,
                provider_id,
                service_category,
                created_at
            `)
            .eq('submission_type', 'provider_listing')
            .eq('listing_status', 'approved');

        const { data: listings, error } = await query;

        if (error) {
            console.error('Supabase query error:', error);
            throw error;
        }

        console.log(`[services/offerings] Found ${listings?.length || 0} approved listings`);

        // 2. Fetch provider data separately for non-null provider_ids
        const providerIds = [...new Set(listings.filter(l => l.provider_id).map(l => l.provider_id))];
        let providerMap = {};

        if (providerIds.length > 0) {
            const { data: providers } = await supabaseAdmin
                .from('users')
                .select('id, name, avatar')
                .in('id', providerIds);

            if (providers) {
                providers.forEach(p => providerMap[p.id] = p);
            }
        }

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

            // Extract Category - prefer service_category from DB, fallback to form_data
            const category = item.service_category || formData.category_name || formData.category || 'Standard Service';

            // Get provider from our providerMap
            const providerData = providerMap[item.provider_id] || {};

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
                    id: providerData.id || item.provider_id,
                    name: providerData.name || 'Provider',
                    avatar: providerData.avatar
                }
            };
        });

        res.json({ services });
    } catch (error) {
        console.error('Get service offerings error:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// GET /api/services/offerings/:id - Get single service detail
router.get('/offerings/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!isSupabaseConfigured()) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const { data: submission, error } = await supabaseAdmin
            .from('submissions')
            .select('*')
            .eq('id', id)
            .eq('submission_type', 'provider_listing')
            .eq('listing_status', 'approved')
            .single();

        if (error || !submission) {
            return res.status(404).json({ error: 'Service not found or not approved' });
        }

        // Fetch provider data
        let provider = null;
        if (submission.provider_id) {
            const { data: providerData } = await supabaseAdmin
                .from('users')
                .select('id, name, avatar')
                .eq('id', submission.provider_id)
                .single();
            provider = providerData;
        }

        const formData = submission.form_data || {};

        // Extract images array
        let images = [];
        for (const key in formData) {
            if (key.includes('image') || key === 'photos' || key === 'pictures') {
                const val = formData[key];
                if (Array.isArray(val)) {
                    images = images.concat(val);
                } else if (typeof val === 'string' && (val.startsWith('data:image') || val.startsWith('http'))) {
                    images.push(val);
                }
            }
        }

        const service = {
            id: submission.id,
            templateId: submission.template_id,
            title: formData.title || 'Untitled Service',
            price: formData.price || '0',
            unit: formData.unit || '次',
            description: formData.description || formData.details || '',
            category: submission.service_category || formData.category_name || formData.category || 'Standard Service',
            images: images,
            image: images[0] || null,
            provider: {
                id: provider?.id || submission.provider_id,
                name: provider?.name || 'Provider',
                avatar: provider?.avatar
            },
            formData: formData // Include full form data for any additional fields
        };

        res.json({ service });
    } catch (error) {
        console.error('Get service detail error:', error);
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});

export default router;

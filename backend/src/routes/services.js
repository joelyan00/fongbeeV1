import express from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const router = express.Router();

// GET /api/services/offerings - Public endpoint to get approved provider listings
// Query params:
// - city: Filter by service city (e.g., "Toronto", "多伦多")
// - category: Filter by category name
router.get('/offerings', async (req, res) => {
    try {
        if (!isSupabaseConfigured()) {
            return res.json({ services: [] });
        }

        const { city, category } = req.query;
        let allServices = [];

        // 1. Fetch from provider_services table (new PC form submissions)
        try {
            let psQuery = supabaseAdmin
                .from('provider_services')
                .select('*')
                .eq('status', 'approved');

            // Filter by category if provided
            if (category) {
                psQuery = psQuery.eq('category', category);
            }

            const { data: providerServices, error: psError } = await psQuery;

            console.log(`[services/offerings] provider_services query: found ${providerServices?.length || 0} results, error: ${psError?.message || 'none'}`);

            if (!psError && providerServices) {
                // Filter by city if provided
                let filteredServices = providerServices;
                if (city) {
                    const cityLower = city.toLowerCase();
                    filteredServices = providerServices.filter(svc => {
                        // Services without service_city are treated as "available everywhere"
                        if (!svc.service_city || (Array.isArray(svc.service_city) && svc.service_city.length === 0)) {
                            return true;
                        }
                        // Handle both string and array format
                        if (Array.isArray(svc.service_city)) {
                            return svc.service_city.some(c => c.toLowerCase().includes(cityLower) || cityLower.includes(c.toLowerCase()));
                        }
                        return svc.service_city.toLowerCase().includes(cityLower) || cityLower.includes(svc.service_city.toLowerCase());
                    });
                }

                // Fetch provider data
                const providerIds = [...new Set(filteredServices.filter(s => s.provider_id).map(s => s.provider_id))];
                let psProviderMap = {};

                if (providerIds.length > 0) {
                    const { data: providers } = await supabaseAdmin
                        .from('users')
                        .select('id, name, avatar')
                        .in('id', providerIds);
                    if (providers) providers.forEach(p => psProviderMap[p.id] = p);
                }

                // Transform provider_services
                filteredServices.forEach(svc => {
                    const provider = psProviderMap[svc.provider_id] || {};
                    allServices.push({
                        id: svc.id,
                        source: 'provider_services',
                        title: svc.title || 'Untitled Service',
                        price: svc.price,
                        unit: svc.price_unit || '次',
                        description: svc.description || '',
                        image: Array.isArray(svc.images) && svc.images.length > 0 ? svc.images[0] : null,
                        images: svc.images || [],
                        category: svc.category || 'Standard Service',
                        serviceMode: svc.service_mode,
                        depositRatio: svc.deposit_ratio,
                        serviceCity: svc.service_city,
                        provider: {
                            id: provider.id || svc.provider_id,
                            name: provider.name || 'Provider',
                            avatar: provider.avatar
                        }
                    });
                });
            }
        } catch (e) {
            console.error('provider_services fetch error:', e);
        }

        // 2. Fetch from submissions table (legacy H5 form)
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
        }

        console.log(`[services/offerings] Found ${listings?.length || 0} approved submissions, ${allServices.length} provider_services`);

        // 3. Fetch provider data for submissions
        if (listings && listings.length > 0) {
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

            // Transform submissions
            listings.forEach(item => {
                const formData = item.form_data || {};

                // --- Filter Logic Start ---
                // 1. Filter by Category
                const itemCategory = item.service_category || formData.category_name || formData.category || 'Standard Service';
                if (category && itemCategory !== category) {
                    return; // Skip if category doesn't match
                }

                // 2. Filter by City
                if (city) {
                    const cityLower = city.toLowerCase();
                    const svcCity = formData.service_city || formData.city; // Handle potential variations
                    let match = false;

                    if (svcCity) {
                        if (Array.isArray(svcCity)) {
                            match = svcCity.some(c => c.toLowerCase().includes(cityLower) || cityLower.includes(c.toLowerCase()));
                        } else if (typeof svcCity === 'string') {
                            match = svcCity.toLowerCase().includes(cityLower) || cityLower.includes(svcCity.toLowerCase());
                        }
                    }
                    // If service_city is not defined, we might default to showing it (global) or hiding it? 
                    // Usually if it's undefined, it might be a global service.
                    // But for now, if city filter is active and service has NO city info, safe to hide or show? 
                    // Let's assume if no city info, it's NOT specific to this city, unless we treat null as 'all'.
                    // provider_services logic: `if (!svc.service_city) return false;` (Line 52 of original file).
                    // So we should strictly require a match.
                    if (!match) return;
                }
                // --- Filter Logic End ---

                let price = formData.price || '0';

                // Extract Images
                let image = null;
                for (const key in formData) {
                    if (key.includes('image') || key === 'photos' || key === 'picture') {
                        const val = formData[key];
                        if (Array.isArray(val) && val.length > 0) image = val[0];
                        else if (typeof val === 'string' && val.startsWith('data:image')) image = val;
                    }
                }
                if (!image) {
                    const vals = Object.values(formData);
                    const imgVal = vals.find(v => typeof v === 'string' && (v.startsWith('data:image') || v.startsWith('http')));
                    if (imgVal) image = imgVal;
                }

                const description = formData.description || formData.details || '';
                const providerData = providerMap[item.provider_id] || {};

                allServices.push({
                    id: item.id,
                    source: 'submissions',
                    templateId: item.template_id,
                    title: formData.title || 'Untitled Service',
                    price: price,
                    unit: formData.unit || '次',
                    description: description,
                    image: image,
                    category: itemCategory,
                    serviceCity: formData.service_city,
                    provider: {
                        id: providerData.id || item.provider_id,
                        name: providerData.name || 'Provider',
                        avatar: providerData.avatar
                    }
                });
            });
        }

        res.json({ services: allServices });
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

        // 1. Try provider_services table first
        const { data: providerService, error: psError } = await supabaseAdmin
            .from('provider_services')
            .select('*')
            .eq('id', id)
            .eq('status', 'approved')
            .maybeSingle();

        if (providerService) {
            // Fetch provider data
            let provider = null;
            if (providerService.provider_id) {
                const { data: providerData } = await supabaseAdmin
                    .from('users')
                    .select('id, name, avatar')
                    .eq('id', providerService.provider_id)
                    .single();
                provider = providerData;
            }

            const service = {
                id: providerService.id,
                source: 'provider_services',
                title: providerService.title,
                price: providerService.price,
                unit: providerService.price_unit || '次',
                description: providerService.description || '',
                category: providerService.category || 'Standard Service',
                images: providerService.images || [],
                image: (providerService.images && providerService.images[0]) || null,
                serviceMode: providerService.service_mode,
                depositRatio: providerService.deposit_ratio,
                inclusions: providerService.inclusions,
                exclusions: providerService.exclusions,
                extraFees: providerService.extra_fees,
                clientRequirements: providerService.client_requirements,
                advanceBooking: providerService.advance_booking,
                cancellationPolicy: providerService.cancellation_policy,
                addOns: providerService.add_ons || [],
                provider: {
                    id: provider?.id || providerService.provider_id,
                    name: provider?.name || 'Provider',
                    avatar: provider?.avatar
                }
            };

            return res.json({ service });
        }

        // 2. Fallback to submissions table
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
            source: 'submissions',
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
            formData: formData
        };

        res.json({ service });
    } catch (error) {
        console.error('Get service detail error:', error);
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});

export default router;

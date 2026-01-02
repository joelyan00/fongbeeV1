import { supabase, supabaseAdmin } from '../config/supabase.js';

export const getAllArticles = async (req, res) => {
    try {
        const { type, category, status, limit, sort } = req.query;

        // Use admin client to ensure we can see all data regardless of RLS
        // (RLS might be blocking anon users from seeing the rows)
        let query = supabaseAdmin
            .from('cms_articles')
            .select('*', { count: 'exact' });
        if (type) query = query.eq('type', type);
        if (category) query = query.eq('category', category);

        // If status is provided, filter by it. If not, if it's admin (implied by route usually but here we filter), 
        // normally we'd default to 'published' for public endpoints. 
        // For simplicity, if status is NOT provided, we return all (for list management) OR just published?
        // Let's default to 'published' unless 'all' or specific status is requested
        if (status && status !== 'all') {
            query = query.eq('status', status);
        } else if (!status) {
            query = query.eq('status', 'published');
        }

        // Sorting
        if (sort === 'views') {
            query = query.order('views', { ascending: false });
        } else if (sort === 'recent') {
            query = query.order('created_at', { ascending: false });
        } else if (sort === 'priority') {
            query = query.order('sort_order', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        if (limit) query = query.limit(parseInt(limit));

        const { data, error } = await query;

        if (error) throw error;

        res.json({ articles: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getArticleBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { data, error } = await supabaseAdmin
            .from('cms_articles')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Not found
                return res.status(404).json({ error: 'Article not found' });
            }
            throw error;
        }

        // Increment views (fire and forget)
        // Using admin client to bypass RLS for view updates
        if (supabaseAdmin) {
            supabaseAdmin.from('cms_articles')
                .update({ views: (data.views || 0) + 1 })
                .eq('id', data.id)
                .then(() => { });
        }

        res.json({ article: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin
            .from('cms_articles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json({ article: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Create
export const createArticle = async (req, res) => {
    try {
        const { title, type, content, slug, category, cover_image, summary, status, sort_order } = req.body;

        if (!title || !type) return res.status(400).json({ error: 'Title and Type are required' });

        const payload = {
            title,
            type,
            content,
            slug: slug || undefined, // undefined to let DB handle it or null? DB unique constraint might skip nulls? Postgres allows multiple nulls in unique column usually. 
            // Better to generate slug if missing? For now let's pass it.
            category,
            cover_image,
            summary,
            status: status || 'draft',
            sort_order: sort_order || 0
        };

        const { data, error } = await supabaseAdmin
            .from('cms_articles')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        res.json({ article: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Update
export const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabaseAdmin
            .from('cms_articles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json({ article: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: Delete
export const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
            .from('cms_articles')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Article deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock storage for quotes (if no DB)
const mockQuotes = [];

// Helper: Check if user is provider
const requireProvider = (req, res, next) => {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ error: '只有服务商可以进行报价' });
    }
    next();
};

// GET /api/quotes/cost/:submissionId - Get quote credit cost for a submission
router.get('/cost/:submissionId', authenticateToken, requireProvider, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const providerId = req.user.id;

        if (isSupabaseConfigured()) {
            // Get submission's template_id
            const { data: submission } = await supabaseAdmin
                .from('submissions')
                .select('template_id')
                .eq('id', submissionId)
                .single();

            if (!submission) return res.status(404).json({ error: '订单不存在' });

            // Get template's quote_credit_cost
            let cost = 0;
            if (submission.template_id) {
                const { data: template } = await supabaseAdmin
                    .from('form_templates')
                    .select('quote_credit_cost')
                    .eq('id', submission.template_id)
                    .single();
                if (template) {
                    cost = template.quote_credit_cost || 0;
                }
            }

            // Get provider's current credits
            const { data: userData } = await supabaseAdmin
                .from('users')
                .select('credits')
                .eq('id', providerId)
                .single();

            const currentCredits = userData?.credits || 0;

            res.json({
                cost,
                currentCredits,
                remainingAfterQuote: currentCredits - cost,
                canQuote: currentCredits >= cost
            });
        } else {
            // Mock mode - assume 10 points cost
            res.json({ cost: 10, currentCredits: 100, remainingAfterQuote: 90, canQuote: true });
        }
    } catch (error) {
        console.error('Get quote cost error:', error);
        res.status(500).json({ error: '获取报价成本失败' });
    }
});

// POST /api/quotes - Create a quote (Deducts credits)
router.post('/', authenticateToken, requireProvider, async (req, res) => {
    try {
        const { submissionId, price, message, deposit } = req.body;
        const providerId = req.user.id;

        if (!submissionId || !price) {
            return res.status(400).json({ error: '缺少必要参数 (submissionId, price)' });
        }

        // Validate deposit (if provided)
        if (deposit && Number(deposit) > Number(price)) {
            return res.status(400).json({ error: '定金不能超过总报价' });
        }

        if (isSupabaseConfigured()) {
            // 1. Get Submission & Template to find Cost
            const { data: submission } = await supabaseAdmin
                .from('submissions')
                .select('template_id, status, user_id') // need user_id to know who to notify later
                .eq('id', submissionId)
                .single();

            if (!submission) return res.status(404).json({ error: '需求订单不存在' });
            if (submission.status === 'completed' || submission.status === 'cancelled') {
                return res.status(400).json({ error: '该订单已结束，无法报价' });
            }

            // Check if already quoted
            const { data: existingQuote } = await supabaseAdmin
                .from('service_quotes')
                .select('id')
                .eq('submission_id', submissionId)
                .eq('provider_id', providerId)
                .single();

            if (existingQuote) {
                return res.status(400).json({ error: '您已经对该订单报过价了' });
            }

            // Get Cost
            let cost = 0;
            if (submission.template_id) {
                const { data: template } = await supabaseAdmin
                    .from('form_templates')
                    .select('quote_credit_cost')
                    .eq('id', submission.template_id)
                    .single();
                if (template) {
                    cost = template.quote_credit_cost || 0;
                }
            }

            // 2. Check Provider Balance
            const { data: providerUser } = await supabaseAdmin
                .from('users')
                .select('credits')
                .eq('id', providerId)
                .single();

            const currentCredits = providerUser?.credits || 0;

            if (currentCredits < cost) {
                return res.status(402).json({
                    error: `积分不足。本次报价需要 ${cost} 积分，您当前余额 ${currentCredits} 积分。`,
                    required: cost,
                    balance: currentCredits
                });
            }

            // 3. Execute Transaction (Deduct Credits + Insert Quote)
            // Ideally should be a DB transaction/RPC. Doing sequentially here.

            // A. Deduct Credits
            const { error: deductError } = await supabaseAdmin
                .from('users')
                .update({ credits: currentCredits - cost })
                .eq('id', providerId);

            if (deductError) throw deductError;

            // B. record Transaction Log
            await supabaseAdmin.from('credit_transactions').insert({
                user_id: providerId,
                amount: -cost,
                type: 'quote_fee',
                description: `报价消耗 (订单ID: ${submissionId.slice(0, 8)}...)`,
                created_by: providerId
            });

            // C. Insert Quote
            const { data: quote, error: quoteError } = await supabaseAdmin
                .from('service_quotes')
                .insert({
                    submission_id: submissionId,
                    provider_id: providerId,
                    quote_price: price, // Total Price
                    deposit_price: deposit || 0, // Deposit
                    message: message || '',
                    status: 'pending'
                })
                .select()
                .single();

            if (quoteError) {
                // Critical: If quote fails, we should refund credits. 
                // Simple rollback attempt:
                await supabaseAdmin.from('users').update({ credits: currentCredits }).eq('id', providerId);
                throw quoteError;
            }

            // D. Create Notification for User
            try {
                await supabaseAdmin.from('notifications').insert({
                    user_id: submission.user_id,
                    type: 'quote_received',
                    title: '收到新报价',
                    content: `您有新的服务商报价：¥${price}`,
                    related_id: submissionId,
                    is_read: false
                });
            } catch (notifyError) {
                console.error('Failed to create notification', notifyError);
            }

            res.status(201).json({ message: '报价成功', quote, remainingCredits: currentCredits - cost });

        } else {
            // Mock Mode
            // Check if already quoted
            if (mockQuotes.find(q => q.submission_id === submissionId && q.provider_id === providerId)) {
                return res.status(400).json({ error: '已报价' });
            }

            const newQuote = {
                id: uuidv4(),
                submission_id: submissionId,
                provider_id: providerId,
                quote_price: price,
                message: message,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            mockQuotes.push(newQuote);
            res.status(201).json({ message: '报价成功 (Mock)', quote: newQuote });
        }

    } catch (error) {
        console.error('Create quote error:', error);
        res.status(500).json({ error: '报价失败，请重试' });
    }
});

// GET /api/quotes/submission/:submissionId - List quotes for a submission (User View)
router.get('/submission/:submissionId', authenticateToken, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (isSupabaseConfigured()) {
            // Check Access: Must be Owner of submission or Admin
            if (!isAdmin) {
                const { data: submission } = await supabaseAdmin
                    .from('submissions')
                    .select('user_id')
                    .eq('id', submissionId)
                    .single();

                if (!submission || submission.user_id !== userId) {
                    return res.status(403).json({ error: '无权查看此订单的报价' });
                }
            }

            // Fetch Quotes
            const { data: quotesRaw, error } = await supabaseAdmin
                .from('service_quotes')
                .select('*')
                .eq('submission_id', submissionId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Manually fetch provider info for each quote
            const providerIds = [...new Set(quotesRaw.map(q => q.provider_id))];

            // Fetch users
            const { data: users } = await supabaseAdmin
                .from('users')
                .select('id, name, avatar_url')
                .in('id', providerIds);

            // Fetch provider profiles
            const { data: profiles } = await supabaseAdmin
                .from('provider_profiles')
                .select('user_id, rating, company_name')
                .in('user_id', providerIds);

            // Build lookup maps
            const userMap = {};
            (users || []).forEach(u => { userMap[u.id] = u; });
            const profileMap = {};
            (profiles || []).forEach(p => { profileMap[p.user_id] = p; });

            // Enrich quotes with provider info
            const quotes = quotesRaw.map(q => ({
                ...q,
                provider: {
                    id: q.provider_id,
                    name: profileMap[q.provider_id]?.company_name || userMap[q.provider_id]?.name || '未知服务商',
                    avatar_url: userMap[q.provider_id]?.avatar_url,
                    provider_profiles: {
                        rating: profileMap[q.provider_id]?.rating || 5.0,
                        orders_count: 0
                    }
                }
            }));

            res.json({ quotes });

        } else {
            // Mock
            const quotes = mockQuotes.filter(q => q.submission_id === submissionId);
            res.json({ quotes });
        }

    } catch (error) {
        console.error('Get quotes error:', error);
        res.status(500).json({ error: '获取报价列表失败' });
    }
});

// GET /api/quotes/my-quotes - List my quotes (Provider View)
router.get('/my-quotes', authenticateToken, requireProvider, async (req, res) => {
    try {
        const providerId = req.user.id;

        if (isSupabaseConfigured()) {
            const { data: quotes, error } = await supabaseAdmin
                .from('service_quotes')
                .select(`
                    *,
                    submission:submission_id (
                        form_data,
                        status
                    )
                `)
                .eq('provider_id', providerId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json({ quotes });
        } else {
            const quotes = mockQuotes.filter(q => q.provider_id === providerId);
            res.json({ quotes });
        }
    } catch (error) {
        console.error('Get my quotes error:', error);
        res.status(500).json({ error: '获取我的报价失败' });
    }
});

// POST /api/quotes/:id/accept - User accepts a quote (Hires provider)
router.post('/:id/accept', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (isSupabaseConfigured()) {
            // 1. Get Quote & Submission info
            const { data: quote, error: quoteError } = await supabaseAdmin
                .from('service_quotes')
                .select('*, submission:submission_id(user_id, status)')
                .eq('id', id)
                .single();

            if (quoteError || !quote) {
                return res.status(404).json({ error: '报价不存在' });
            }

            // 2. Check Permissions
            // Must be the owner of the submission
            // Note: Supabase response might return submission as array or object depending on relationship. 
            // Assuming .single() returns object for quote, and one-to-one mapping for foreign key? 
            // Actually submission_id is foreign key, so it returns single object usually if mapped correct.
            // If submission is null, data integrity issue.

            const submission = quote.submission;
            if (!submission) return res.status(404).json({ error: '关联订单不存在' });

            if (submission.user_id !== userId) {
                return res.status(403).json({ error: '您无权操作此订单' });
            }

            if (submission.status !== 'pending') {
                return res.status(400).json({ error: '订单当前状态无法进行雇佣' });
            }

            // 3. Transactions (Update Submission + Update Quote)

            // A. Update Submission
            const { error: subError } = await supabaseAdmin
                .from('submissions')
                .update({
                    status: 'processing', // or 'accepted'
                    assigned_provider_id: quote.provider_id,
                    total_price: quote.quote_price,
                    deposit_price: quote.deposit_price || 0,
                    updated_at: new Date().toISOString()
                })
                .eq('id', quote.submission_id);

            if (subError) throw subError;

            // B. Update Quote Status
            const { error: qError } = await supabaseAdmin
                .from('service_quotes')
                .update({ status: 'accepted' })
                .eq('id', id);

            if (qError) {
                console.error('Failed to update quote status', qError);
                // Non-critical (?) but good to match
            }

            // C. Reject other quotes? (Optional, skipping for now)

            res.json({ message: '雇佣成功', provider_id: quote.provider_id });

        } else {
            // Mock
            const quote = mockQuotes.find(q => q.id === id);
            if (!quote) return res.status(404).json({ error: 'Quote not found' });

            quote.status = 'accepted';
            res.json({ message: '雇佣成功 (Mock)', provider_id: quote.provider_id });
        }
    } catch (error) {
        console.error('Accept quote error:', error);
        res.status(500).json({ error: '操作失败' });
    }
});

export default router;

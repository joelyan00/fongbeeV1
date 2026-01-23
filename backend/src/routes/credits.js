/**
 * Credits Routes
 * Handles credits balance and consumption
 */
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getUserCreditsBalance, getListingCreditCost, getQuoteDefaultCost, rechargeCredits } from '../services/creditsService.js';


const router = express.Router();

// ============================================================
// GET /api/credits/balance - Get user's credits balance
// ============================================================
router.get('/balance', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const balance = await getUserCreditsBalance(userId);

        // Trigger auto-recharge check on balance fetch (fire and forget)
        const { checkAndTriggerAutoRecharge } = await import('../services/creditsService.js');
        checkAndTriggerAutoRecharge(userId, balance.purchased).catch(err => {
            console.error('[Balance] Auto-recharge check failed:', err.message);
        });

        res.json({
            success: true,
            data: balance
        });
    } catch (error) {
        console.error('Get credits balance error:', error);
        res.status(500).json({
            success: false,
            message: '获取积分余额失败',
            error: error.message
        });
    }
});

// ============================================================
// GET /api/credits/listing-cost - Get standard listing cost
// ============================================================
router.get('/listing-cost', async (req, res) => {
    try {
        const cost = await getListingCreditCost();
        res.json({ success: true, cost });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// GET /api/credits/quote-cost - Get default quote cost
// ============================================================
router.get('/quote-cost', async (req, res) => {
    try {
        const cost = await getQuoteDefaultCost();
        res.json({ success: true, cost });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// POST /api/credits/recharge - Purchase credits
// ============================================================
router.post('/recharge', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, paymentMethodId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: '无效的充值金额' });
        }

        const result = await rechargeCredits(userId, amount, paymentMethodId);
        res.json(result);
    } catch (error) {
        console.error('Recharge route error:', error);
        res.status(500).json({
            success: false,
            message: error.message || '充值失败'
        });
    }
});

export default router;

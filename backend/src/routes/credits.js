/**
 * Credits Routes
 * Handles credits balance and consumption
 */
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getUserCreditsBalance, getListingCreditCost, getQuoteDefaultCost } from '../services/creditsService.js';


const router = express.Router();

// ============================================================
// GET /api/credits/balance - Get user's credits balance
// ============================================================
router.get('/balance', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const balance = await getUserCreditsBalance(userId);

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

export default router;

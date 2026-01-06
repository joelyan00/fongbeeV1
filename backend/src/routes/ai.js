import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// AI-assisted text editing endpoint
router.post('/rewrite', authenticateToken, async (req, res) => {
    try {
        const { text, context, language = 'zh' } = req.body;

        if (!text || text.trim().length < 10) {
            return res.status(400).json({ error: 'Text must be at least 10 characters' });
        }

        // Context determines the type of content being rewritten
        const contextPrompts = {
            'service_description': '服务描述，需要专业、清晰、吸引客户',
            'inclusions': '服务包含项目清单，需要条理清晰',
            'exclusions': '服务不包含项目清单，需要明确说明',
            'extra_fees': '额外费用说明，需要透明清晰',
            'client_requirements': '客户须知/准备事项，需要简洁明了',
            'general': '专业服务文案'
        };

        const contextHint = contextPrompts[context] || contextPrompts['general'];

        // For now, use a simple enhancement algorithm
        // In production, integrate with OpenAI/Gemini API
        let enhancedText = enhanceText(text, context, language);

        res.json({
            original: text,
            enhanced: enhancedText,
            message: '内容已优化'
        });
    } catch (e) {
        console.error('AI rewrite error:', e);
        res.status(500).json({ error: '处理失败，请稍后重试' });
    }
});

// Simple text enhancement function (placeholder for real AI integration)
function enhanceText(text, context, language) {
    // Clean up the text
    let enhanced = text.trim();

    // Add bullet points if multiple lines without them
    const lines = enhanced.split('\n').filter(l => l.trim());
    if (lines.length > 1 && !lines.some(l => l.trim().startsWith('•') || l.trim().startsWith('-'))) {
        enhanced = lines.map(l => `• ${l.trim()}`).join('\n');
    }

    // Add professional formatting based on context
    if (context === 'service_description' && enhanced.length < 100) {
        // Expand short descriptions
        enhanced = `专业服务团队为您提供：\n\n${enhanced}\n\n我们承诺提供高质量、准时、可靠的服务。如有任何疑问，欢迎随时咨询。`;
    }

    if (context === 'inclusions' && !enhanced.includes('✓') && !enhanced.includes('•')) {
        // Add checkmarks for inclusions
        const items = enhanced.split('\n').filter(l => l.trim());
        enhanced = items.map(l => `✓ ${l.trim().replace(/^[•\-]\s*/, '')}`).join('\n');
    }

    if (context === 'exclusions' && !enhanced.includes('✗') && !enhanced.includes('•')) {
        // Add X marks for exclusions
        const items = enhanced.split('\n').filter(l => l.trim());
        enhanced = items.map(l => `✗ ${l.trim().replace(/^[•\-]\s*/, '')}`).join('\n');
    }

    if (context === 'extra_fees') {
        // Format fees clearly
        if (!enhanced.includes('$') && !enhanced.includes('￥')) {
            enhanced = enhanced.replace(/(\d+)/g, '$$$1');
        }
    }

    if (context === 'client_requirements') {
        // Add note about requirements
        if (!enhanced.toLowerCase().includes('请') && !enhanced.toLowerCase().includes('注意')) {
            enhanced = `请注意以下事项：\n\n${enhanced}`;
        }
    }

    return enhanced;
}

export default router;

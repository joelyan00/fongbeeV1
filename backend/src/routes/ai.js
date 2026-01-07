import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI-assisted text editing endpoint
router.post('/rewrite', authenticateToken, async (req, res) => {
    try {
        const { text, context, language = 'zh' } = req.body;

        if (!text || text.trim().length < 5) {
            return res.status(400).json({ error: 'Text must be at least 5 characters' });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not found. Using simple fallback.');
            return res.json({
                original: text,
                enhanced: simpleEnhanceText(text, context),
                message: 'API Key missing, performing simple format.'
            });
        }

        // Context determines the type of content being rewritten
        const contextPrompts = {
            'service_description': 'Professional service description. Make it attractive, trustworthy, and clear.',
            'inclusions': 'List of service inclusions. Make it structured and clear.',
            'exclusions': 'List of exclusions. Be precise and polite.',
            'extra_fees': 'Extra fees policy. Be transparent and professional.',
            'client_requirements': 'Client requirements/preparations. Be polite but clear.',
            'general': 'Professional business text.'
        };

        const contextInstruction = contextPrompts[context] || contextPrompts['general'];

        // Construct the prompt
        const prompt = `
Role: You are a professional copywriter for a premium home service platform (like Youfujia).
Task: Rewrite and improve the following text via ${language === 'zh' ? 'Chinese' : 'English'}.
Context: ${contextInstruction}
Goal: Make the text more professional, engaging, and easy to read. Fix any grammar issues. Use bullet points if suitable.

Original Text:
"${text}"

Enhanced Text:
`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let enhancedText = response.text();

        // Clean up markdown code blocks if present
        enhancedText = enhancedText.replace(/```[a-z]*\n/g, '').replace(/```/g, '').trim();

        res.json({
            original: text,
            enhanced: enhancedText,
            message: 'Content enhanced by AI'
        });

    } catch (e) {
        console.error('AI rewrite error:', e);
        // Fallback to simple enhancement if AI fails
        res.json({
            original: text,
            enhanced: simpleEnhanceText(text, req.body.context),
            message: 'AI service busy, performing simple format.'
        });
    }
});

// Simple fallback function
function simpleEnhanceText(text, context) {
    let enhanced = text.trim();
    const lines = enhanced.split('\n').filter(l => l.trim());

    // Add simple formatting
    if (lines.length > 1 && !lines.some(l => l.trim().startsWith('•'))) {
        enhanced = lines.map(l => `• ${l.trim()}`).join('\n');
    }

    if (context === 'service_description' && enhanced.length < 50) {
        return `Professional Service: ${enhanced}`;
    }

    return enhanced;
}

export default router;

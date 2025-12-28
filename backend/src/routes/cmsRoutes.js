import express from 'express';
import * as cmsController from '../controllers/cmsController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public Routes
router.get('/', cmsController.getAllArticles);
router.get('/slug/:slug', cmsController.getArticleBySlug);
router.get('/:id', cmsController.getArticleById);

// Admin Routes - Protected
router.post('/', authenticateToken, requireAdmin, cmsController.createArticle);
router.put('/:id', authenticateToken, requireAdmin, cmsController.updateArticle);
router.delete('/:id', authenticateToken, requireAdmin, cmsController.deleteArticle);

export default router;

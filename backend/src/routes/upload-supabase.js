import express from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// Allowed image extensions and MIME types
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];

// Configure multer for memory storage (to upload to Supabase)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Check MIME type
        if (!file.mimetype.startsWith('image/') || !ALLOWED_MIMETYPES.includes(file.mimetype)) {
            return cb(new Error('仅允许上传图片文件 (JPG, PNG, GIF, WebP, HEIC)'));
        }
        // Check extension
        const ext = '.' + (file.originalname.split('.').pop() || '').toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return cb(new Error('不支持的图片格式，请使用 JPG, PNG, GIF, WebP 或 HEIC'));
        }
        cb(null, true);
    }
});

// Upload single file to Supabase Storage
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        // Generate unique filename
        const ext = req.file.originalname.split('.').pop() || 'jpg';
        const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
        const path = `service-photos/${filename}`;

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
            .from('uploads')
            .upload(path, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('uploads')
            .getPublicUrl(path);

        res.json({
            success: true,
            url: urlData.publicUrl,
            path: data.path
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload multiple files
router.post('/multiple', upload.array('files', 9), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }

        const urls = [];

        for (const file of req.files) {
            const ext = file.originalname.split('.').pop() || 'jpg';
            const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
            const path = `service-photos/${filename}`;

            const { data, error } = await supabaseAdmin.storage
                .from('uploads')
                .upload(path, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (error) {
                console.error('Supabase upload error:', error);
                continue;
            }

            const { data: urlData } = supabaseAdmin.storage
                .from('uploads')
                .getPublicUrl(path);

            urls.push(urlData.publicUrl);
        }

        res.json({
            success: true,
            urls
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

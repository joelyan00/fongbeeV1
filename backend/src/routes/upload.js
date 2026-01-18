import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define upload directory (backend/uploads)
const uploadDir = path.join(__dirname, '../../uploads');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed image extensions and MIME types
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        // Generate unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname).toLowerCase();
        // Only use extension if it's allowed, otherwise default to .jpg
        const safeExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : '.jpg';
        cb(null, uniqueSuffix + safeExt)
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Check MIME type
        if (!file.mimetype.startsWith('image/') || !ALLOWED_MIMETYPES.includes(file.mimetype)) {
            return cb(new Error('仅允许上传图片文件 (JPG, PNG, GIF, WebP, HEIC)'));
        }
        // Check extension
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return cb(new Error('不支持的图片格式，请使用 JPG, PNG, GIF, WebP 或 HEIC'));
        }
        cb(null, true);
    }
});

// Upload endpoint
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct full URL using server address
    // But for simplicity, return relative path which frontend can prepend API_BASE_URL's host
    // Or better, serve it statically from backend root.

    const url = `/uploads/${req.file.filename}`;
    res.json({
        url,
        originalName: req.file.originalname,
        size: req.file.size
    });
});

export default router;

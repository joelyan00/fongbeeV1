import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import formTemplatesRoutes from './routes/formTemplates.js';
import submissionsRoutes from './routes/submissions.js';
import providersRoutes from './routes/providers.js';
import categoriesRoutes from './routes/categories.js';
import quotesRoutes from './routes/quotes.js';
import notificationsRoutes from './routes/notifications.js';
import paymentRoutes from './routes/payment.js';
import ordersRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import bannerRoutes from './routes/banners.js';
import uploadRoutes from './routes/upload.js';
import smsTemplatesRoutes from './routes/smsTemplates.js';
import cmsRoutes from './routes/cmsRoutes.js';
import citiesRoutes from './routes/cities.js';
import addressesRoutes from './routes/addresses.js';
import salesRoutes from './routes/sales.js';
import invoicesRoutes from './routes/invoices.js';
import contractsRoutes from './routes/contracts.js';
import ordersV2Routes from './routes/ordersV2.js';
import webhooksRoutes from './routes/webhooks.js';
import { initPaymentCronJobs } from './cron/paymentCron.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize cron jobs
initPaymentCronJobs();

// Middleware
const allowedOrigins = [
    'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:3000',
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, '')) : [])
].filter(Boolean);

console.log('✅ CORS Allowed Origins:', allowedOrigins);

// Strict CORS Configuration (Restored)
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps/curl)
        if (!origin) return callback(null, true);

        // Allow localhost, specific domains, and Local LAN IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        const isLocalNetwork =
            origin.startsWith('http://192.168.') ||
            origin.startsWith('http://10.') ||
            origin.startsWith('http://172.');

        // Allow Vercel preview deployments (fongbee-v1-*.vercel.app)
        const isVercelPreview =
            origin.includes('fongbee-v1') && origin.includes('.vercel.app');

        if (allowedOrigins.indexOf(origin) !== -1 || isLocalNetwork || isVercelPreview) {
            callback(null, true);
        } else {
            console.log('❌ CORS Blocked Origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/form-templates', formTemplatesRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/sms-templates', smsTemplatesRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/orders-v2', ordersV2Routes);
app.use('/api/webhooks', webhooksRoutes);

// Serve static uploads
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📌 API endpoints available at http://localhost:${PORT}/api`);
});

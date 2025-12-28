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

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000',
        ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [])
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

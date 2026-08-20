import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import env from './config/env';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notification';
import wishlistRoutes from './routes/wishlist';
import settingsRoutes from './routes/settings.routes';
import adminSettingsRoutes from './routes/adminSettings.routes';
import publicRoutes from './routes/public.routes';
import seoRoutes from './routes/seo';
import scheduledMessageRoutes from './routes/scheduledMessages';
import festivalMessageRoutes from './routes/festivalMessages';
import bulkOrderRoutes from './routes/bulkOrderRoutes';
import { authenticate, requireSuperAdmin } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';


const app = express();
app.set('trust proxy', 1);
const PORT = env.PORT;

// Security headers
app.use(helmet());

// CORS - restrict to allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'https://dkexporting.com', 'https://www.dkexporting.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Too many OTP requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());

// Public routes
app.use('/api/settings', settingsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/public/bulk-orders', bulkOrderRoutes);
app.use('/api/seo', seoRoutes);

// Auth routes with rate limiting
app.use('/api/auth', (req, res, next) => {
  if (req.path.includes('otp') || req.path.includes('forgot-password') || req.path.includes('guest-login')) {
    return otpLimiter(req, res, next);
  }
  return authLimiter(req, res, next);
}, authRoutes);

// Protected admin routes
app.use('/api/admin', authenticate, requireSuperAdmin, adminRoutes);
app.use('/api/admin/settings', authenticate, requireSuperAdmin, adminSettingsRoutes);
app.use('/api/admin/scheduled-messages', authenticate, requireSuperAdmin, scheduledMessageRoutes);
app.use('/api/admin/festival-messages', authenticate, requireSuperAdmin, festivalMessageRoutes);
app.use('/api/notifications', authenticate, requireSuperAdmin, notificationRoutes);

// Other protected routes
app.use('/api/wishlist', authenticate, wishlistRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DK Exporting API is running' });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(Number(PORT), () => {
  console.log(`Server is running on port ${PORT}`);
  setInterval(() => {
    // Keep alive
  }, 1000 * 60 * 60);
});

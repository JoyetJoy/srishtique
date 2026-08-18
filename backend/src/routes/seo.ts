import express from 'express';
import { 
  getSeoForPage, 
  getAllStaticSeo, 
  updateStaticSeo, 
  createStaticSeo 
} from '../controllers/seo.controller';
import { authenticate, requireSuperAdmin } from '../middleware/auth';

const router = express.Router();

// Public route to fetch SEO by path
router.get('/', getSeoForPage);

// Admin routes
router.get('/admin', authenticate, requireSuperAdmin, getAllStaticSeo);
router.post('/admin', authenticate, requireSuperAdmin, createStaticSeo);
router.put('/admin/:id', authenticate, requireSuperAdmin, updateStaticSeo);

export default router;

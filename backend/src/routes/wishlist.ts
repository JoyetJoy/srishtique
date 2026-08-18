import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protect all wishlist routes so only logged-in users can access them
router.use(authenticate);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

export default router;

import { Router } from 'express';
import { getSetting } from '../controllers/settings.controller';

const router = Router();

// Public route to get a setting
router.get('/:key', getSetting);

export default router;

import { Router } from 'express';
import { updateSetting } from '../controllers/settings.controller';
import { authenticate, requireSuperAdmin } from '../middleware/auth';

const router = Router();

router.put('/:key', authenticate, requireSuperAdmin, updateSetting);

export default router;

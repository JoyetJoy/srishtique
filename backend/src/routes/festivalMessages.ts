import { Router } from 'express';
import {
  getFestivalMessages,
  createFestivalMessage,
  updateFestivalMessage,
  deleteFestivalMessage,
  sendFestivalNow,
} from '../controllers/festivalMessage.controller';

const router = Router();

router.get('/', getFestivalMessages);
router.post('/', createFestivalMessage);
router.put('/:id', updateFestivalMessage);
router.delete('/:id', deleteFestivalMessage);
router.post('/:id/send-now', sendFestivalNow);

export default router;

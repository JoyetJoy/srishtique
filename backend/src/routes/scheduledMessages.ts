import { Router } from 'express';
import {
  getScheduledMessages,
  createScheduledMessage,
  updateScheduledMessage,
  deleteScheduledMessage,
  sendScheduledMessageNow,
} from '../controllers/scheduledMessage.controller';

const router = Router();

router.get('/', getScheduledMessages);
router.post('/', createScheduledMessage);
router.put('/:id', updateScheduledMessage);
router.delete('/:id', deleteScheduledMessage);
router.post('/:id/send-now', sendScheduledMessageNow);

export default router;

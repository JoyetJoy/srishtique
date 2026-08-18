import express from 'express';
import { notificationEmitter } from '../utils/notificationEmitter';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send an initial heartbeat to establish connection
  res.write('data: {"type":"connected"}\n\n');

  let user: any = null;
  const token = req.query.token as string;
  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      // invalid token, ignore
    }
  }

  const onNewOrder = (order: any) => {
    res.write(`data: ${JSON.stringify({ type: 'NEW_ORDER', order })}\n\n`);
  };

  const onRestockRequest = () => {
    res.write(`data: ${JSON.stringify({ type: 'NEW_RESTOCK_REQUEST' })}\n\n`);
  };

  const onItemRestocked = (productData: any) => {
    res.write(`data: ${JSON.stringify({ type: 'ITEM_RESTOCKED', productData })}\n\n`);
  };

  if (user && user.role === 'SUPER_ADMIN') {
    notificationEmitter.on('new_order', onNewOrder);
    notificationEmitter.on('new_restock_request', onRestockRequest);
  }

  if (user && user.userId) {
    notificationEmitter.on(`ITEM_RESTOCKED_${user.userId}`, onItemRestocked);
  }

  req.on('close', () => {
    notificationEmitter.off('new_order', onNewOrder);
    notificationEmitter.off('new_restock_request', onRestockRequest);
    if (user && user.userId) {
      notificationEmitter.off(`ITEM_RESTOCKED_${user.userId}`, onItemRestocked);
    }
  });
});

export default router;

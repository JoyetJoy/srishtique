import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const bulkOrderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  product: z.string().min(1, 'Product is required'),
  quantity: z.number().optional().nullable(),
  note: z.string().optional().nullable(),
});

router.post('/', async (req, res) => {
  try {
    const validatedData = bulkOrderSchema.parse(req.body);
    
    const inquiry = await prisma.bulkOrderInquiry.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        product: validatedData.product,
        quantity: validatedData.quantity || null,
        note: validatedData.note || null,
      },
    });

    res.status(201).json({ success: true, message: 'Bulk order inquiry submitted successfully', inquiry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: (error as any).errors });
    }
    console.error('Error submitting bulk order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;

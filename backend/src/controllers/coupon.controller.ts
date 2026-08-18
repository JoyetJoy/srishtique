import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};

export const getActiveCoupons = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [
          { validUntil: null },
          { validUntil: { gt: now } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch active coupons' });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    // ensure code is uppercase
    if (data.code) {
      data.code = data.code.toUpperCase();
    }
    const coupon = await prisma.coupon.create({
      data
    });
    res.status(201).json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.code) {
      data.code = data.code.toUpperCase();
    }
    const coupon = await prisma.coupon.update({
      where: { id: parseInt(id as string) },
      data
    });
    res.json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({
      where: { id: parseInt(id as string) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
};

import jwt from 'jsonwebtoken';

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });

    if (!coupon.isActive) return res.status(400).json({ error: 'This coupon is no longer active' });

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) return res.status(400).json({ error: 'Coupon is not valid yet' });
    if (coupon.validUntil && now > coupon.validUntil) return res.status(400).json({ error: 'Coupon has expired' });

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit has been reached' });
    }

    if (coupon.minOrderValue !== null && cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ error: `Minimum order value of ₹${coupon.minOrderValue} required` });
    }

    if (coupon.isFirstPurchaseOnly) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
          if (decoded && decoded.userId) {
            const orderCount = await prisma.order.count({ where: { userId: decoded.userId } });
            if (orderCount > 0) {
              return res.status(400).json({ error: 'This coupon is only valid for your first purchase' });
            }
          }
        } catch (e) {
          // Ignore token errors here, they might be logged out or guest
        }
      }
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'FIXED') {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
};

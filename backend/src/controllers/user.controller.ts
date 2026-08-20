import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendOrderConfirmation } from '../utils/email';
import { notificationEmitter } from '../utils/notificationEmitter';



export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, phone: true, name: true, address: true, password: true, addresses: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { password, ...userData } = user;
    res.json({ ...userData, hasPassword: !!password });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, address } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name, address },
      select: { id: true, email: true, name: true, address: true }
    });

    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const setPassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.password) {
      return res.status(400).json({ error: 'Password is already set' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password set successfully. You can now log in normally.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to set password' });
  }
};

export const initiatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { items, couponCode, addressId } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let selectedAddress;
    if (addressId) {
      selectedAddress = await prisma.address.findFirst({
        where: { id: addressId, userId }
      });
      if (!selectedAddress) {
        return res.status(404).json({ error: 'Address not found or does not belong to user' });
      }
    } else if (user.address) {
      try {
        selectedAddress = JSON.parse(user.address);
      } catch (e) {
        selectedAddress = { street: user.address };
      }
    } else {
      return res.status(400).json({ error: 'Shipping address is required to place an order' });
    }

    // Perform transaction
    const orderResult = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: { product: true }
        });

        if (!variant) {
          throw new Error(`"${item.name || 'Product'}" is no longer available. Please remove it from your cart and try again.`);
        }

        if (variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${variant.product.name}" (Size: ${variant.size})`);
        }

        // Decrement stock
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: variant.stock - item.quantity }
        });

        totalAmount += variant.price * item.quantity;
        orderItemsData.push({
          productVariantId: variant.id,
          quantity: item.quantity,
          priceAtPurchase: variant.price
        });
      }

      // Process Coupon if provided
      let discountAmount = 0;
      let appliedCouponId: number | null = null;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
        if (coupon && coupon.isActive) {
          const now = new Date();
          const validFrom = coupon.validFrom ? now >= coupon.validFrom : true;
          const validUntil = coupon.validUntil ? now <= coupon.validUntil : true;
          const usageOk = coupon.usageLimit !== null ? coupon.usedCount < coupon.usageLimit : true;
          const minOk = coupon.minOrderValue !== null ? totalAmount >= coupon.minOrderValue : true;
          
          if (validFrom && validUntil && usageOk && minOk) {
            if (coupon.discountType === 'PERCENTAGE') {
              let calculatedDiscount = (totalAmount * coupon.discountValue) / 100;
              if (coupon.maxDiscount !== null && calculatedDiscount > coupon.maxDiscount) {
                calculatedDiscount = coupon.maxDiscount;
              }
              discountAmount = calculatedDiscount;
            } else if (coupon.discountType === 'FIXED') {
              discountAmount = coupon.discountValue;
            }
            appliedCouponId = coupon.id;
          } else {
             throw new Error('Coupon is not valid for this order');
          }
        } else {
           throw new Error('Invalid or inactive coupon');
        }
      }

      const finalAmount = Math.max(totalAmount - discountAmount, 0);

      // Create the Order inside transaction with correct shipping address
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount: finalAmount,
          status: 'PENDING',
          shippingAddress: JSON.stringify(selectedAddress),
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      });
      
      const d = new Date(newOrder.createdAt);
      const orderNumber = `DK-${d.getFullYear()}${String(d.getMonth()+1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${newOrder.id.toString().padStart(5, '0')}`;
      
      await tx.order.update({
        where: { id: newOrder.id },
        data: { orderNumber }
      });
      
      (newOrder as any).orderNumber = orderNumber;

      if (appliedCouponId) {
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } }
        });
      }

      return { newOrder, finalAmount };
    }, {
      maxWait: 15000,
      timeout: 20000
    });

    // Create Razorpay Order OUTSIDE the database transaction to avoid timeout
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(orderResult.finalAmount * 100),
      currency: 'INR',
      receipt: `receipt_order_${orderResult.newOrder.id}`
    });

    const updatedOrder = await prisma.order.update({
      where: { id: orderResult.newOrder.id },
      data: { 
        razorpayOrderId: razorpayOrder.id
      },
      include: { items: { include: { productVariant: { include: { product: true } } } } }
    });

    res.status(201).json({ 
      message: 'Order initiated successfully', 
      order: updatedOrder,
      razorpayOrderId: razorpayOrder.id,
      amount: orderResult.finalAmount,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Failed to initiate order' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'PROCESSING',
          razorpayPaymentId: razorpay_payment_id
        },
        include: {
          user: true,
          items: {
            include: {
              productVariant: {
                include: { product: true }
              }
            }
          }
        }
      });

      // Send order confirmation email
      try {
        const items = order.items.map(item => ({
          name: item.productVariant.product.name,
          quantity: item.quantity,
          price: item.priceAtPurchase,
        }));
        await sendOrderConfirmation(order.user.email || '', order.id, items, order.totalAmount);
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }

      // Notify admin
      notificationEmitter.emit('new_order', {
        id: order.id,
        totalAmount: order.totalAmount,
        customerName: order.user.name || order.user.email,
        createdAt: order.createdAt
      });





      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      // Payment failed — notify customer via Telegram

      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// ---- Wishlist ----
// Wishlist logic moved to wishlist.controller.ts to avoid duplication

export const addAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { street, city, state, country, pincode, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: { userId, street, city, state, country, pincode, isDefault: isDefault || false }
    });

    res.json({ message: 'Address added successfully', address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add address' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const addressId = parseInt(req.params.id as string);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { street, city, state, country, pincode, isDefault } = req.body;

    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!existingAddress) return res.status(404).json({ error: 'Address not found' });

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: { street, city, state, country, pincode, isDefault: isDefault || false }
    });

    res.json({ message: 'Address updated successfully', address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update address' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const addressId = parseInt(req.params.id as string);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!existingAddress) return res.status(404).json({ error: 'Address not found' });

    await prisma.address.delete({ where: { id: addressId } });

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const addressId = parseInt(req.params.id as string);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!existingAddress) return res.status(404).json({ error: 'Address not found' });

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true }
    });

    res.json({ message: 'Default address updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to set default address' });
  }
};


// ---- Cart Tracking ----

export const trackCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items must be an array' });
    }

    if (items.length === 0) {
      await prisma.cartAbandonment.deleteMany({ where: { userId } });
      return res.json({ success: true });
    }

    const existing = await prisma.cartAbandonment.findFirst({ where: { userId } });

    if (existing) {
      await prisma.cartAbandonment.update({
        where: { id: existing.id },
        data: {
          cartSnapshot: items,
          reminder1hSent: false,
          reminder24hSent: false,
          reminder3dSent: false,
        },
      });
    } else {
      await prisma.cartAbandonment.create({
        data: {
          userId,
          cartSnapshot: items,
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to track cart' });
  }
};

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const existing = await prisma.cartAbandonment.findFirst({ where: { userId } });
    if (!existing || !existing.cartSnapshot) {
      return res.json({ items: [] });
    }

    let items = existing.cartSnapshot;
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch(e) { items = []; }
    }

    res.json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
};

// ---- Get Order by ID ----
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const orderId = parseInt(req.params.id as string);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
        rating: true,
      },
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

// ---- Rate Order ----
export const rateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const orderId = parseInt(req.params.id as string);
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderRating = await prisma.orderRating.upsert({
      where: { orderId },
      update: { rating, review },
      create: { orderId, userId, rating, review },
    });

    res.json(orderRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to rate order' });
  }
};

// ---- Subscribe to Stock Notification ----
export const subscribeStockNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { productVariantId } = req.body;

    if (!productVariantId) {
      return res.status(400).json({ error: 'productVariantId is required' });
    }

    const notification = await prisma.stockNotification.upsert({
      where: {
        userId_productVariantId: { userId, productVariantId },
      },
      update: { notified: false },
      create: { userId, productVariantId },
    });
    
    // Notify admin in real-time
    notificationEmitter.emit('new_restock_request');

    res.json({ success: true, notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
};

// ---- Check Stock Notification ----
export const checkStockNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { productVariantId } = req.query;

    if (!productVariantId) {
      return res.json({ subscribed: false });
    }

    const notification = await prisma.stockNotification.findUnique({
      where: {
        userId_productVariantId: { userId, productVariantId: parseInt(productVariantId as string) },
      },
    });

    res.json({ subscribed: !!notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check notification' });
  }
};

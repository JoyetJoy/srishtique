import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { uploadToSpaces } from '../utils/s3';
import { sendOrderStatusUpdate, sendRestockNotification } from '../utils/email';
import { notificationEmitter } from '../utils/notificationEmitter';


// ---- Upload ----
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    const folder = req.body.folder || 'uploads';
    const url = await uploadToSpaces(req.file, folder);
    res.json({ url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'File upload failed' });
  }
};

// ---- Category ----
export const getCategories = async (req: Request, res: Response) => {
  const { search = '', page = '1', limit = '10' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = {
    name: { contains: search as string }
  };

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take,
      include: {
        sizeChartMaster: true,
        _count: {
          select: { products: true }
        }
      }
    }),
    prisma.category.count({ where })
  ]);

  res.json({ categories, total, page: Number(page), limit: take });
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, slug, image, sizeChart, sizeChartMasterId, type, metaTitle, metaDescription, metaKeywords } = req.body;
  const category = await prisma.category.create({
    data: { 
      name, slug, image, sizeChart, 
      sizeChartMasterId: sizeChartMasterId ? Number(sizeChartMasterId) : null,
      type: type || 'CLOTHING', metaTitle, metaDescription, metaKeywords 
    },
    include: { sizeChartMaster: true }
  });
  res.json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug, image, sizeChart, sizeChartMasterId, type, metaTitle, metaDescription, metaKeywords } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id: parseInt(id as string) },
      data: { 
        name, slug, image, sizeChart, 
        sizeChartMasterId: sizeChartMasterId !== undefined ? (sizeChartMasterId ? Number(sizeChartMasterId) : null) : undefined,
        ...(type && { type }), metaTitle, metaDescription, metaKeywords 
      },
      include: { sizeChartMaster: true }
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const categoryId = parseInt(id as string);

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const productCount = await prisma.product.count({
      where: { categoryId }
    });

    if (productCount > 0) {
      return res.status(400).json({ error: `Cannot delete "${category.name}". ${productCount} product(s) are linked to it.` });
    }

    await prisma.category.delete({ where: { id: categoryId } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete category error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to delete category' });
  }
};

// ---- Occasion ----
export const getOccasions = async (req: Request, res: Response) => {
  const occasions = await prisma.occasion.findMany({
    include: { _count: { select: { products: true } } }
  });
  res.json(occasions);
};

export const addProductsToOccasion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { productIds } = req.body;
  
  if (!Array.isArray(productIds)) {
    return res.status(400).json({ error: 'productIds must be an array' });
  }

  try {
    const occasion = await prisma.occasion.update({
      where: { id: parseInt(id as string) },
      data: {
        products: {
          connect: productIds.map((pid: number) => ({ id: pid }))
        }
      },
      include: { _count: { select: { products: true } } }
    });
    res.json(occasion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add products to occasion' });
  }
};

export const createOccasion = async (req: Request, res: Response) => {
  const { name, slug, image, heroImage, metaTitle, metaDescription, metaKeywords } = req.body;
  const occasion = await prisma.occasion.create({
    data: { name, slug, image, heroImage, metaTitle, metaDescription, metaKeywords },
  });
  res.json(occasion);
};

export const updateOccasion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug, image, heroImage, metaTitle, metaDescription, metaKeywords } = req.body;
  try {
    const occasion = await prisma.occasion.update({
      where: { id: parseInt(id as string) },
      data: { name, slug, image, heroImage, metaTitle, metaDescription, metaKeywords },
    });
    res.json(occasion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update occasion' });
  }
};

export const deleteOccasion = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const productCount = await prisma.product.count({
      where: { occasions: { some: { id: parseInt(id as string) } } }
    });

    if (productCount > 0) {
      return res.status(400).json({ error: `Cannot delete occasion. ${productCount} product(s) are linked to it. Remove or reassign them first.` });
    }

    await prisma.occasion.delete({
      where: { id: parseInt(id as string) },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete occasion' });
  }
};

// ---- Product ----
export const getProducts = async (req: Request, res: Response) => {
  const { search = '', page = '1', limit = '10', type = 'ALL' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {
    name: { contains: search as string }
  };

  if (type !== 'ALL') {
    where.type = type;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { category: { include: { sizeChartMaster: true } }, sizeChartMaster: true, occasions: true, variants: true },
    }),
    prisma.product.count({ where })
  ]);

  res.json({ products, total, page: Number(page), limit: take });
};

export const createProduct = async (req: Request, res: Response) => {
  const { 
    name, description, productDetails, sizeAndFit, materialAndCare, 
    specifications, categoryId, occasionIds, images, variants, sizeChart, sizeChartMasterId,
    isNewArrival, isTrending, type, metaTitle, metaDescription, metaKeywords
  } = req.body;
  
  const product = await prisma.product.create({
    data: {
      name, description, 
      productDetails: productDetails || [], 
      sizeAndFit, 
      materialAndCare: materialAndCare || [], 
      specifications: specifications || {},
      categoryId, images, sizeChart,
      sizeChartMasterId: sizeChartMasterId ? Number(sizeChartMasterId) : null,
      occasions: occasionIds && occasionIds.length > 0 ? { connect: occasionIds.map((id: number) => ({ id })) } : undefined,
      type: type || 'CLOTHING',
      isNewArrival: isNewArrival || false,
      isTrending: isTrending || false,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      metaKeywords: metaKeywords || null,
      variants: {
        create: variants.map((v: any) => ({
          size: v.size,
          color: v.color,
          price: v.price,
          originalPrice: v.originalPrice,
          stock: v.stock,
          sku: v.sku,
          images: v.images || []
        }))
      }
    },
    include: { variants: true }
  });
  res.json(product);
};

export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id as string) },
      include: { variants: true, occasions: true, sizeChartMaster: true, category: { include: { sizeChartMaster: true } } },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    name, description, categoryId, occasionIds, images, sizeChart, sizeChartMasterId,
    productDetails, materialAndCare, sizeAndFit, specifications, variants,
    isNewArrival, isTrending, type, metaTitle, metaDescription, metaKeywords
  } = req.body;

  try {
    const productId = parseInt(id as string);

    // Update product first
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name, description, categoryId, images, sizeChart,
        sizeChartMasterId: sizeChartMasterId !== undefined ? (sizeChartMasterId ? Number(sizeChartMasterId) : null) : undefined,
        occasions: occasionIds ? { set: occasionIds.map((id: number) => ({ id })) } : { set: [] },
        productDetails: productDetails || [],  
        materialAndCare: materialAndCare || [], 
        sizeAndFit, 
        specifications: specifications || {},
        type: type || 'CLOTHING',
        isNewArrival: isNewArrival || false,
        isTrending: isTrending || false,
        metaTitle: metaTitle !== undefined ? metaTitle : null,
        metaDescription: metaDescription !== undefined ? metaDescription : null,
        metaKeywords: metaKeywords !== undefined ? metaKeywords : null
      }
    });

    // Handle variants safely
    const existingVariants = await prisma.productVariant.findMany({ where: { productId } });
    const newVariantKeys = variants.map((v: any) => `${v.size}-${v.color}`);

    for (const v of variants) {
      const existingVariant = existingVariants.find(ev => ev.size === v.size && ev.color === v.color);

      const updatedVariant = await prisma.productVariant.upsert({
        where: {
          productId_size_color: {
            productId,
            size: v.size,
            color: v.color
          }
        },
        update: {
          price: v.price,
          originalPrice: v.originalPrice,
          stock: v.stock,
          sku: v.sku,
          images: v.images || []
        },
        create: {
          productId,
          size: v.size,
          color: v.color,
          price: v.price,
          originalPrice: v.originalPrice,
          stock: v.stock,
          sku: v.sku,
          images: v.images || []
        }
      });

      if (existingVariant && existingVariant.stock === 0 && v.stock > 0) {
        const notifications = await prisma.stockNotification.findMany({
          where: { productVariantId: updatedVariant.id, notified: false },
          include: { user: true }
        });

        for (const notif of notifications) {
          if (notif.user.email) {
            const productUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/product/${productId}`;
            try {
              await sendRestockNotification(notif.user.email, name || 'Item', productUrl);
            } catch (err) {
              console.error('Failed to send restock email:', err);
            }
          }
          
          notificationEmitter.emit(`ITEM_RESTOCKED_${notif.userId}`, { 
            productId, 
            name, 
            variant: v 
          });

          await prisma.stockNotification.update({
            where: { id: notif.id },
            data: { notified: true }
          });
        }
      }
    }

    for (const existing of existingVariants) {
      if (!newVariantKeys.includes(`${existing.size}-${existing.color}`)) {
        try {
          await prisma.productVariant.delete({ where: { id: existing.id } });
        } catch (e) {
          // If referenced by OrderItem, we can't delete. Set stock to 0 instead.
          await prisma.productVariant.update({
            where: { id: existing.id },
            data: { stock: 0 }
          });
        }
      }
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.productVariant.deleteMany({ where: { productId: parseInt(id as string) } });
    await prisma.product.delete({ where: { id: parseInt(id as string) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// ---- Customers ----
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search = '', page = '1', limit = '10' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { role: 'USER' };
    
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
        { phone: { contains: search as string } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: { orders: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({ customers, total, page: Number(page), limit: take });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id as string, 10);
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        orders: {
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
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customer details' });
  }
};

// ---- Testimonials ----
export const getTestimonials = async (req: Request, res: Response) => {
  const testimonials = await prisma.testimonial.findMany();
  res.json(testimonials);
};

export const createTestimonial = async (req: Request, res: Response) => {
  const { name, rating, text, productImg } = req.body;
  const testimonial = await prisma.testimonial.create({
    data: { name, rating: parseInt(rating), text, productImg },
  });
  res.json(testimonial);
};

export const updateTestimonial = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, rating, text, productImg } = req.body;
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id: parseInt(id as string) },
      data: { name, rating: parseInt(rating), text, productImg },
    });
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.testimonial.delete({
      where: { id: parseInt(id as string) },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
};

// ---- Orders ----
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search && typeof search === 'string') {
      const searchStr = search.trim();
      const isNumber = !isNaN(Number(searchStr));

      whereClause.OR = [
        { user: { name: { contains: searchStr } } },
        { user: { email: { contains: searchStr } } }
      ];

      if (isNumber) {
        whereClause.OR.push({ id: Number(searchStr) });
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, phone: true } },
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
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, shippingMethod, trackingNumber } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = { status };
    if (shippingMethod) updateData.shippingMethod = shippingMethod;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    const order = await prisma.order.update({
      where: { id: parseInt(id as string) },
      data: updateData,
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

    // Send order status update email
    try {
      await sendOrderStatusUpdate(order.user.email || '', order.id, status, trackingNumber || undefined);
    } catch (emailError) {
      console.error('Failed to send order status update email:', emailError);
    }


    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// ---- Process Refund ----
export const processRefund = async (req: Request, res: Response) => {
  try {
    const { orderId, reason } = req.body;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status to CANCELLED (refund processed)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });



    res.json({ success: true, order: updatedOrder, refundAmount: order.totalAmount });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
};

// ---- Dashboard Stats ----
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { range, start, end, offset } = req.query as { range?: string, start?: string, end?: string, offset?: string };
    
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    let periodLabel = '';
    const now = new Date();
    
    // Default to 'today' if not provided
    const selectedRange = range || 'today';
    const numOffset = parseInt(offset || '0', 10) || 0;

    if (selectedRange === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + numOffset);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + numOffset, 23, 59, 59, 999);
      
      if (numOffset === 0) periodLabel = 'Today';
      else if (numOffset === -1) periodLabel = 'Yesterday';
      else periodLabel = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      
    } else if (selectedRange === 'this_week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) + (numOffset * 7); 
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      
      const formatOpts = { day: 'numeric', month: 'short', year: 'numeric' } as any;
      periodLabel = `${startDate.toLocaleDateString('en-GB', formatOpts)} - ${endDate.toLocaleDateString('en-GB', formatOpts)}`;
      if (numOffset === 0) periodLabel = 'This Week';
      else if (numOffset === -1) periodLabel = 'Last Week';
      
    } else if (selectedRange === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() + numOffset, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + numOffset + 1, 0, 23, 59, 59, 999);
      periodLabel = startDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      if (numOffset === 0) periodLabel = 'This Month';
      else if (numOffset === -1) periodLabel = 'Last Month';
      
    } else if (selectedRange === 'this_year') {
      startDate = new Date(now.getFullYear() + numOffset, 0, 1);
      endDate = new Date(now.getFullYear() + numOffset, 11, 31, 23, 59, 59, 999);
      periodLabel = startDate.getFullYear().toString();
      if (numOffset === 0) periodLabel = 'This Year';
      else if (numOffset === -1) periodLabel = 'Last Year';
      
    } else if (selectedRange === 'custom' && start && end) {
      startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      periodLabel = `${startDate.toLocaleDateString('en-GB')} - ${endDate.toLocaleDateString('en-GB')}`;
    } else if (selectedRange === 'all_time') {
      periodLabel = 'All Time';
    }

    const dateFilter = (startDate && endDate) ? { gte: startDate, lte: endDate } : undefined;
    const whereDate = dateFilter ? { createdAt: dateFilter } : {};

    // 1. Basic Totals
    const totalOrders = await prisma.order.count({ where: whereDate });
    const totalProducts = await prisma.product.count({ where: whereDate });
    const activeUsers = await prisma.user.count({ where: { role: 'USER', ...whereDate } });
    
    // Revenue sum (exclude cancelled)
    const revenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' }, ...whereDate }
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // 2. Revenue Overview
    const revenueData = [];
    const dateObj = new Date();

    if (selectedRange === 'today') {
      // Hourly
      for (let i = 0; i <= 23; i++) {
        const startHour = new Date(startDate!.getFullYear(), startDate!.getMonth(), startDate!.getDate(), i, 0, 0);
        const endHour = new Date(startDate!.getFullYear(), startDate!.getMonth(), startDate!.getDate(), i, 59, 59, 999);
        const rev = await prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { not: 'CANCELLED' }, createdAt: { gte: startHour, lte: endHour } }
        });
        revenueData.push({
          name: `${i}:00`,
          revenue: rev._sum.totalAmount || 0
        });
      }
    } else if (selectedRange === 'this_week') {
      // Daily for this week
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7; i++) {
        const targetDay = new Date(startDate!);
        targetDay.setDate(targetDay.getDate() + i);
        const startDay = new Date(targetDay);
        startDay.setHours(0, 0, 0, 0);
        const endDay = new Date(targetDay);
        endDay.setHours(23, 59, 59, 999);
        const rev = await prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { not: 'CANCELLED' }, createdAt: { gte: startDay, lte: endDay } }
        });
        revenueData.push({
          name: days[targetDay.getDay()],
          revenue: rev._sum.totalAmount || 0
        });
      }
    } else if (selectedRange === 'this_month' || selectedRange === 'custom') {
      const diffTime = Math.abs(endDate!.getTime() - startDate!.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 31) {
        // Daily
        for (let i = 0; i < diffDays; i++) {
          const targetDay = new Date(startDate!);
          targetDay.setDate(targetDay.getDate() + i);
          const startDay = new Date(targetDay);
          startDay.setHours(0, 0, 0, 0);
          const endDay = new Date(targetDay);
          endDay.setHours(23, 59, 59, 999);
          const rev = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { status: { not: 'CANCELLED' }, createdAt: { gte: startDay, lte: endDay } }
          });
          revenueData.push({
            name: `${targetDay.getDate()}/${targetDay.getMonth()+1}`,
            revenue: rev._sum.totalAmount || 0
          });
        }
      } else {
        // Monthly
        const monthsStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let curr = new Date(startDate!);
        curr.setDate(1);
        while (curr <= endDate!) {
          const startMonth = new Date(curr.getFullYear(), curr.getMonth(), 1);
          const endMonth = new Date(curr.getFullYear(), curr.getMonth() + 1, 0, 23, 59, 59, 999);
          const rev = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { status: { not: 'CANCELLED' }, createdAt: { gte: startMonth, lte: endMonth } }
          });
          revenueData.push({
            name: `${monthsStr[curr.getMonth()]} ${curr.getFullYear()}`,
            revenue: rev._sum.totalAmount || 0
          });
          curr.setMonth(curr.getMonth() + 1);
        }
      }
    } else if (selectedRange === 'all_time') {
      const firstOrder = await prisma.order.findFirst({ orderBy: { createdAt: 'asc' } });
      const startYr = firstOrder ? firstOrder.createdAt.getFullYear() : dateObj.getFullYear();
      const diffYrs = dateObj.getFullYear() - startYr;
      for (let i = 0; i <= diffYrs; i++) {
        const yr = startYr + i;
        const startOfYear = new Date(yr, 0, 1);
        const endOfYear = new Date(yr, 11, 31, 23, 59, 59, 999);
        const rev = await prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfYear, lte: endOfYear } }
        });
        revenueData.push({
          name: yr.toString(),
          revenue: rev._sum.totalAmount || 0
        });
      }
    } else {
      // this_year or fallback: Monthly for the year
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const targetYear = startDate ? startDate.getFullYear() : dateObj.getFullYear();
      for (let i = 0; i < 12; i++) {
        const startOfMonth = new Date(targetYear, i, 1);
        const endOfMonth = new Date(targetYear, i + 1, 0, 23, 59, 59, 999);
        const rev = await prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfMonth, lte: endOfMonth } }
        });
        revenueData.push({
          name: months[i],
          revenue: rev._sum.totalAmount || 0
        });
      }
    }

    // 3. Orders by Category
    const categories = await prisma.category.findMany();
    const categoryData = [];
    for (const cat of categories) {
      const count = await prisma.orderItem.count({
        where: {
          productVariant: { product: { categoryId: cat.id } },
          order: whereDate
        }
      });
      if (count > 0) {
        categoryData.push({
          name: cat.name,
          orders: count
        });
      }
    }
    categoryData.sort((a, b) => b.orders - a.orders);
    const topCategories = categoryData.slice(0, 5);

    // 4. Recent Orders
    const recentOrders = await prisma.order.findMany({
      where: whereDate,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    const startOfTodayRaw = new Date();
    startOfTodayRaw.setHours(0, 0, 0, 0);
    const todayRevResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfTodayRaw } }
    });
    const trueTodayRevenue = todayRevResult._sum.totalAmount || 0;

    // 6. Order Status Data
    const orderStatuses = await prisma.order.groupBy({
      by: ['status'],
      where: whereDate,
      _count: { status: true }
    });
    const orderStatusData = orderStatuses.map(item => ({
      name: item.status,
      value: item._count.status
    }));

    // 7. Low Stock Alerts
    const lowStockItems = await prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      take: 5,
      orderBy: { stock: 'asc' },
      include: {
        product: { select: { name: true, images: true } }
      }
    });

    // 8. Recent Customers
    const recentCustomers = await prisma.user.findMany({
      where: { role: 'USER', ...whereDate },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { name: true, email: true, createdAt: true }
    });

    res.json({
      periodLabel,
      stats: [
        { label: 'Period Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, trend: '', isPositive: true },
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, trend: '', isPositive: true },
        { label: 'Total Orders', value: totalOrders.toString(), trend: '', isPositive: true },
        { label: 'New Products', value: totalProducts.toString(), trend: '', isPositive: true },
        { label: 'New Users', value: activeUsers.toString(), trend: '', isPositive: true }
      ],
      revenueData,
      categoryData: topCategories,
      orderStatusData,
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        productName: item.product.name,
        image: Array.isArray(item.product.images) ? item.product.images[0] : null,
        variantInfo: `${item.size} - ${item.color}`,
        stock: item.stock
      })),
      recentCustomers: recentCustomers.map(c => ({
        name: c.name || 'Guest',
        email: c.email,
        date: c.createdAt.toISOString()
      })),
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        customerName: o.user.name || o.user.email || 'Guest',
        date: o.createdAt.toISOString(),
        status: o.status,
        amount: o.totalAmount
      }))
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const updateTrendingProducts = async (req: Request, res: Response) => {
  const { productIds } = req.body;
  try {
    // Reset all products
    await prisma.product.updateMany({
      data: { isTrending: false }
    });
    // Set for selected products
    if (productIds && productIds.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { isTrending: true }
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update trending products' });
  }
};

export const updateNewArrivalsProducts = async (req: Request, res: Response) => {
  const { productIds } = req.body;
  try {
    // Reset all products
    await prisma.product.updateMany({
      data: { isNewArrival: false }
    });
    // Set for selected products
    if (productIds && productIds.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { isNewArrival: true }
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update new arrivals products' });
  }
};

// ---- Size Chart Master ----
export const getSizeCharts = async (req: Request, res: Response) => {
  try {
    const sizeCharts = await prisma.sizeChartMaster.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { categories: true, products: true }
        }
      }
    });
    res.json(sizeCharts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch size charts' });
  }
};

export const getSizeChart = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const sizeChart = await prisma.sizeChartMaster.findUnique({
      where: { id: Number(id) }
    });
    if (!sizeChart) return res.status(404).json({ error: 'Size chart not found' });
    res.json(sizeChart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch size chart' });
  }
};

export const createSizeChart = async (req: Request, res: Response) => {
  const { name, data } = req.body;
  try {
    const sizeChart = await prisma.sizeChartMaster.create({
      data: { name, data }
    });
    res.json(sizeChart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create size chart' });
  }
};

export const updateSizeChart = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, data } = req.body;
  try {
    const sizeChart = await prisma.sizeChartMaster.update({
      where: { id: Number(id) },
      data: { name, data }
    });
    res.json(sizeChart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update size chart' });
  }
};

export const deleteSizeChart = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.sizeChartMaster.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Size chart deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete size chart' });
  }
};

export const toggleProductStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(id as string) },
      data: { isActive }
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
};

export const getRestockRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.stockNotification.groupBy({
      by: ['productVariantId'],
      where: { notified: false },
      _count: { userId: true }
    });

    const detailedRequests = await Promise.all(
      requests.map(async (reqGroup) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: reqGroup.productVariantId },
          include: { product: true }
        });
        return {
          variant,
          waitlistCount: reqGroup._count.userId
        };
      })
    );
    
    // Sort by count descending
    detailedRequests.sort((a, b) => b.waitlistCount - a.waitlistCount);
    
    res.json(detailedRequests);
  } catch (error) {
    console.error('getRestockRequests error:', error);
    res.status(500).json({ error: 'Failed to fetch restock requests' });
  }
};

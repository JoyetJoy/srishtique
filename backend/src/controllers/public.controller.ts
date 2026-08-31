import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getPublicCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { sizeChartMaster: true }
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getPublicOccasions = async (req: Request, res: Response) => {
  try {
    const occasions = await prisma.occasion.findMany();
    res.json(occasions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch occasions' });
  }
};

export const getPublicProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      occasion,
      type,
      isNewArrival,
      isTrending,
      minPrice,
      maxPrice,
    } = req.query;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    if (category) {
      where.category = { slug: category as string };
    }

    if (occasion) {
      where.occasions = { some: { slug: occasion as string } };
    }

    if (type) {
      where.type = type as string;
    }

    if (isNewArrival === 'true') {
      where.isNewArrival = true;
    }

    if (isTrending === 'true') {
      where.isTrending = true;
    }

    if (minPrice || maxPrice) {
      where.variants = {
        some: {
          isDeleted: false,
          price: {
            ...(minPrice && { gte: parseFloat(minPrice as string) }),
            ...(maxPrice && { lte: parseFloat(maxPrice as string) }),
          },
        },
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: { 
        category: { include: { sizeChartMaster: true } }, 
        sizeChartMaster: true, 
        occasions: true, 
        variants: { where: { isDeleted: false } }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getPublicTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany();
    res.json(testimonials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

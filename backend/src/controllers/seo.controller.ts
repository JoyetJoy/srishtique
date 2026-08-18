import { Request as ExpressReq, Response as ExpressRes } from 'express';
import { prisma } from '../prisma';

export const getSeoForPage = async (req: ExpressReq, res: ExpressRes) => {
  try {
    const { path } = req.query;
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Path is required' });
    }

    // Try to find static page SEO
    // @ts-ignore - Prisma client needs regeneration
    const seo = await prisma.staticPageSeo.findUnique({
      where: { pagePath: path }
    });

    if (seo) {
      return res.json(seo);
    }

    // Return empty if not found, frontend will fallback
    return res.json({ metaTitle: null, metaDescription: null, metaKeywords: null });

  } catch (error) {
    console.error('Error fetching SEO:', error);
    res.status(500).json({ error: 'Server error fetching SEO' });
  }
};

// ADMIN ROUTES
export const getAllStaticSeo = async (req: ExpressReq, res: ExpressRes) => {
  try {
    // @ts-ignore
    const seoList = await prisma.staticPageSeo.findMany({
      orderBy: { pagePath: 'asc' }
    });
    res.json(seoList);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateStaticSeo = async (req: ExpressReq, res: ExpressRes) => {
  try {
    const { id } = req.params;
    const { pagePath, metaTitle, metaDescription, metaKeywords } = req.body;

    // @ts-ignore
    const updated = await prisma.staticPageSeo.update({
      where: { id: parseInt(id as string) },
      data: { pagePath, metaTitle, metaDescription, metaKeywords }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating SEO' });
  }
};

export const createStaticSeo = async (req: ExpressReq, res: ExpressRes) => {
  try {
    const { pagePath, metaTitle, metaDescription, metaKeywords } = req.body;

    // @ts-ignore
    const newSeo = await prisma.staticPageSeo.create({
      data: { pagePath, metaTitle, metaDescription, metaKeywords }
    });

    res.status(201).json(newSeo);
  } catch (error) {
    res.status(500).json({ error: 'Server error creating SEO' });
  }
};

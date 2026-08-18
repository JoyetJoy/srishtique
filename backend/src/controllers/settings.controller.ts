import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getSetting = async (req: Request, res: Response) => {
  const { key } = req.params;
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: key as string }
    });
    if (!setting) {
      return res.json({ key: key as string, value: null });
    }
    res.json(setting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
};

export const updateSetting = async (req: Request, res: Response) => {
  const { key } = req.params;
  const { value } = req.body;
  
  if (value === undefined) {
    return res.status(400).json({ error: 'Value is required' });
  }

  try {
    const setting = await prisma.siteSettings.upsert({
      where: { key: key as string },
      update: { value },
      create: { key: key as string, value }
    });
    res.json(setting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

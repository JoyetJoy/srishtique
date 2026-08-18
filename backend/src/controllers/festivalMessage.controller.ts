import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getFestivalMessages = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [messages, total] = await Promise.all([
      prisma.festivalMessage.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.festivalMessage.count(),
    ]);

    res.json({
      messages,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch festival messages' });
  }
};

export const createFestivalMessage = async (req: Request, res: Response) => {
  try {
    const { name, message, imageUrl, buttonLabel, buttonUrl, scheduledDate } =
      req.body;

    if (!name || !message) {
      return res.status(400).json({ error: 'name and message are required' });
    }

    const festivalMessage = await prisma.festivalMessage.create({
      data: {
        name,
        message,
        imageUrl,
        buttonLabel,
        buttonUrl,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
        status: scheduledDate ? 'SCHEDULED' : 'DRAFT',
      },
    });

    res.status(201).json(festivalMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create festival message' });
  }
};

export const updateFestivalMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.scheduledDate) {
      data.scheduledDate = new Date(data.scheduledDate);
    }

    const message = await prisma.festivalMessage.update({
      where: { id: parseInt(id as string) },
      data,
    });

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update festival message' });
  }
};

export const deleteFestivalMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.festivalMessage.delete({
      where: { id: parseInt(id as string) },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete festival message' });
  }
};

export const sendFestivalNow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const msg = await prisma.festivalMessage.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.status === 'SENT') {
      return res.status(400).json({ error: 'Message already sent' });
    }

    // Trigger immediate send
    await prisma.festivalMessage.update({
      where: { id: msg.id },
      data: { scheduledDate: new Date(), status: 'SCHEDULED' },
    });

    res.json({ message: 'Festival message queued for immediate sending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send festival message' });
  }
};

import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getScheduledMessages = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [messages, total] = await Promise.all([
      prisma.scheduledMessage.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.scheduledMessage.count(),
    ]);

    res.json({
      messages,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch scheduled messages' });
  }
};

export const createScheduledMessage = async (req: Request, res: Response) => {
  try {
    const {
      title,
      message,
      imageUrl,
      buttonLabel,
      buttonUrl,
      scheduledAt,
      targetType,
      targetUserIds,
      targetChatId,
    } = req.body;

    if (!title || !message || !scheduledAt) {
      return res
        .status(400)
        .json({ error: 'title, message, and scheduledAt are required' });
    }

    const scheduledMessage = await prisma.scheduledMessage.create({
      data: {
        title,
        message,
        imageUrl,
        buttonLabel,
        buttonUrl,
        scheduledAt: new Date(scheduledAt),
        targetType: targetType || 'ALL_LINKED',
        targetUserIds: targetUserIds || [],
        targetChatId,
      },
    });

    res.status(201).json(scheduledMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create scheduled message' });
  }
};

export const updateScheduledMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.scheduledAt) {
      data.scheduledAt = new Date(data.scheduledAt);
    }

    const message = await prisma.scheduledMessage.update({
      where: { id: parseInt(id as string) },
      data,
    });

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update scheduled message' });
  }
};

export const deleteScheduledMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.scheduledMessage.delete({
      where: { id: parseInt(id as string) },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete scheduled message' });
  }
};

export const sendScheduledMessageNow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const msg = await prisma.scheduledMessage.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.status === 'SENT') {
      return res.status(400).json({ error: 'Message already sent' });
    }

    // Trigger immediate send by updating scheduledAt to now
    await prisma.scheduledMessage.update({
      where: { id: msg.id },
      data: { scheduledAt: new Date(), status: 'PENDING' },
    });

    res.json({ message: 'Message queued for immediate sending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getCountries = async (req: Request, res: Response) => {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(countries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
};

export const getStates = async (req: Request, res: Response) => {
  try {
    const { countryId } = req.query;
    if (!countryId) {
      return res.status(400).json({ error: 'countryId query parameter is required' });
    }

    const states = await prisma.state.findMany({
      where: { countryId: Number(countryId) },
      orderBy: { name: 'asc' }
    });
    res.json(states);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
};

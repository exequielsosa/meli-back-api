import { Request, Response } from 'express';
import { fetchItems, fetchItemDetail } from '../services/itemsService';

export const getItems = (req: Request, res: Response): void => {
  const { q, offset } = req.query;

  if (typeof q !== 'string') {
    res.status(400).json({ error: 'Missing or invalid query parameter "q"' });
    return;
  }

  try {
    const data = fetchItems(q, Number(offset) || 0);
    res.json(data);
  } catch (error) {
    console.error('[getItems] Error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

export const getItemById = (req: Request, res: Response): void => {
  const { id } = req.params;

  try {
    const data = fetchItemDetail(id);
    res.json(data);
  } catch (error) {
    console.error(`[getItemById] Error fetching ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch item detail' });
  }
};

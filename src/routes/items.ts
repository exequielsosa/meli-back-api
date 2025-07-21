import { Router } from 'express';
import { getItems, getItemById } from '../controllers/itemsController';

const router = Router();

router.get('/', getItems);
router.get('/:id', getItemById);

export default router;

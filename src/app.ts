import express, { Application } from 'express';
import itemsRoutes from './routes/items';

const app: Application = express();

app.use(express.json());

app.use('/api/items', itemsRoutes);

export default app;

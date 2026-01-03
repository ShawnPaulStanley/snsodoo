import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API entrypoint (keep frontend concerns out)
app.use('/api/v1', apiRoutes);

// Fallback for unknown API routes
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Centralized error handler
app.use(errorHandler);

export default app;

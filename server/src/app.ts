import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { rateLimiter } from './middleware/rateLimiter';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import roomRouter from './routes/rooms';
import userRouter from './routes/users';

const app = express();

app.use(cors({
  origin: config.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);

app.use(healthRouter);
app.use(authRouter);
app.use(roomRouter);
app.use(userRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

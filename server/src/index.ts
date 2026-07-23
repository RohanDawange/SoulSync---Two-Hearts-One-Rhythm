import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { config } from './config/env';
import { setupSocket } from './socket';

const server = http.createServer(app);

setupSocket(server);

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${config.PORT} is busy, retrying in 1.5 seconds...`);
    setTimeout(() => {
      server.close();
      server.listen(config.PORT);
    }, 1500);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(config.PORT, () => {
  console.log(`SoulSync server running on port ${config.PORT}`);
  console.log(`CORS origin: ${config.CORS_ORIGIN}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

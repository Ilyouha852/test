import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import express from 'express';
import morgan from 'morgan';

import { apiV1Router } from './routes.js';
import { initDynamoDB } from './utils/initDynamoDB.js';

export function buildApp(): Express {
  const app = express();

  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());

  // Инициализируем DynamoDB при запуске приложения
  initDynamoDB().catch(console.error);

  // Простой гарантированный корневой route
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Support Bot IST</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>🤖 Support Bot IST</h1>
          <p>Server is running successfully!</p>
          <h2>Available endpoints:</h2>
          <ul>
            <li><a href="/api/v1/health-check">Health Check</a></li>
            <li><a href="/api/v1/user-profiles">User Profiles</a></li>
            <li><a href="/api/v1/auth/cookies">Get Cookies</a></li>
            <li><a href="/api/v1/counter">Counter (DynamoDB Test)</a></li>
            <li><a href="/api/v1/repair-bot">Repair Bot</a></li>
          </ul>
        </body>
      </html>
    `);
  });

  app.use('/api/v1', apiV1Router);

  // Fallback route для 404
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
}
import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import express from 'express';
import morgan from 'morgan';

import { apiV1Router } from './routes.js';
<<<<<<< HEAD
=======
import { initDynamoDb } from './utils/init-dynamo-db.js';
>>>>>>> 49ffccd303c29fa47674851265707533732e3fbf

export function buildApp(): Express {
    const app = express();

    app.use(morgan('dev'));
    app.use(express.json());
    app.use(cookieParser());

<<<<<<< HEAD
=======
    // Инициализируем DynamoDB при запуске приложения
    initDynamoDb().catch(console.error);

>>>>>>> 49ffccd303c29fa47674851265707533732e3fbf
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
          <p>Сервер успешно запущен!</p>
          <h2>Доступные эндпоинты:</h2>
          <ul>
            <li><a href="/api/v1/health-check">Проверка здоровья (Health Check)</a></li>
            <li><a href="/api/v1/user-profiles">Профили пользователей</a></li>
            <li><a href="/api/v1/auth/cookies">Получить куки</a></li>
            <li><a href="/api/v1/counter">Счетчик (Тест DynamoDB)</a></li>
            <li><a href="/api/v1/repair-bot">Бот ремонта</a></li>
            <li><a href="/api/v1/mainController">Контроллер</a></li>

          </ul>
        </body>
      </html>
    `);
    });

    app.use('/api/v1', apiV1Router);

    // Fallback route для 404
    app.use('*', (req, res) => {
        res.status(404).json({ error: 'Маршрут не найден' });
    });

    return app;
}

import 'dotenv/config';

import express from 'express';
import morgan from 'morgan';

import { MockConnector } from './modules/messenger-aggregator/connectors/mock-connector.js';
import { messengerAggregator } from './modules/messenger-aggregator/messenger-aggregator.js';
import { apiV1Router } from './routes.js';

const serverPort: number = Number(process.env.PORT) || 3007;
const serverUrl: string = process.env.BOT_BASE_URL || 'localhost';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const environment = process.env.NODE_ENV || 'development';

if (environment == 'development') {
    app.use(morgan('dev'));
}

messengerAggregator.registerConnector(new MockConnector());

app.use(apiV1Router);

app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

app.listen(serverPort, serverUrl, () => {
    console.log(`🚀 API Сервер запущен по адресу ${serverUrl}:${serverPort}`);
    console.log(`   GET  /health-check`);
    console.log(`   POST /user_message`);
});

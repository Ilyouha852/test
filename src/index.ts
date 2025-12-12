import 'dotenv/config';
import morgan from 'morgan';

import { buildApp } from './app.js';
import { messengerAggregator } from './modules/messenger-aggregator/MessengerAggregator.js';
import { MockConnector } from './modules/messenger-aggregator/connectors/MockConnector.js';
import { WebServer } from './modules/messenger-aggregator/webServer.js';

const port: number = Number(process.env.PORT) || 3007;

const botBaseUrl: string = process.env.BOT_BASE_URL || `${process.env.PROTOCOL || 'http'}://${process.env.HOST || 'localhost'}:${process.env.BOT_PORT || 3007}`;
const botPort: number = Number(process.env.BOT_PORT) || 3007;


const app = buildApp();

// Morgan должен быть ПЕРВЫМ middleware
const environment = process.env.NODE_ENV || 'development';
app.use(morgan('dev'));

// --- Bot Infrastructure Setup ---
// 1. Register connectors
messengerAggregator.registerConnector(new MockConnector());

// 2. Start Bot WebServer
const botServer = new WebServer(messengerAggregator, botBaseUrl);
botServer.start(botPort);

// --------------------------------

const server = app.listen(port, () => {
  console.log(`🚀 API Сервер запущен по адресу http://localhost:${port}`);
});

process.on('SIGTERM', () => {
  console.log('Получен сигнал SIGTERM: закрытие серверов');
  server.close(() => {
    console.log('HTTP сервер закрыт');
  });
});

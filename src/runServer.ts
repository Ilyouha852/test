import 'dotenv/config';

import { MockConnector } from '../modules/messenger-aggregator/connectors/MockConnector.ts';
import { messengerAggregator } from '../modules/messenger-aggregator/MessengerAggregator.ts';
import { botCoreService } from '../services/BotCoreService.ts';
import { WebServer } from '../modules/messenger-aggregator/webServer.ts';


async function runServer() {
onsole.log('🧪 Запуск');

  // 1. Регистрация коннектора
  const mockConnector = new MockConnector();
  messengerAggregator.registerConnector(mockConnector);
  await messengerAggregator.processWebhook('mock-connector', payload2);

    



}
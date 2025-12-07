import 'dotenv/config';

import { MockConnector } from '../modules/messenger-aggregator/connectors/MockConnector.js';
import { messengerAggregator } from '../modules/messenger-aggregator/MessengerAggregator.js';
import { botCoreService } from '../services/BotCoreService.js';
import { WebServer } from '../modules/messenger-aggregator/webServer.js';

async function runTest() {
  console.log('🧪 Запуск теста Агрегатора...');

  // 1. Регистрация коннектора
  const mockConnector = new MockConnector();
  messengerAggregator.registerConnector(mockConnector);

  // 2. Симуляция входящего вебхука (Текст)
  console.log('\n--- Тест 1: Простое текстовое сообщение(c ожиданием ответа от бота(postman)) --- ');

  // Использование
  const webServer = new WebServer(messengerAggregator);
  webServer.start(4852); // начинает слушать 3000 порт
  // Ожидание первого сообщения
  console.log('Ожидание первого сообщения...');
  await webServer.waitForFirstMessage();
  console.log('Первое сообщение получено! Продолжаем выполнение программы.');


  // 3. Симуляция входящего вебхука (С вложением)
  console.log('\n--- Тест 2: Сообщение с вложением ---');
  const payload2 = {
    text: 'Вот скриншот',
    userId: 'user_1',
    chatId: 'chat_1',
    attachments: [
      {
        type: 'image',
        buffer: Buffer.from('fake-image-data'),
        mimeType: 'image/jpeg',
      },
    ],
  };

  await messengerAggregator.processWebhook('mock-connector', payload2);

  // 4. Тест отправки ответа
  console.log('\n--- Тест 3: Отправка ответа ---');
  await botCoreService.sendToUser(
    'user_1',
    'mock-connector',
    'Это ответ от ядра бота.',
  );

  console.log('\n✅ Тест завершен');
}

runTest().catch(console.error);

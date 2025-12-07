import 'dotenv/config';

import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

import { docClient, TABLE_NAME } from '../config/dynamodb.js';
import { botCoreService } from '../services/BotCoreService.js';
import { uploadTempFile } from '../services/s3Service.js';
import { initDynamoDB } from '../utils/initDynamoDB.js';

async function testFullFlow() {
  console.log('🚀 Запуск теста полного цикла ядра (Full Core Flow)');

  // 0. Убедимся что таблица существует
  console.log('\n--- Шаг 0: Инициализация таблицы DynamoDB ---');
  await initDynamoDB();

  // 1. Симуляция загрузки файла (как будто от мессенджера)
  console.log('\n--- Шаг 1: Симуляция загрузки файла (Temp) ---');
  const fakeBuffer = Buffer.from('Test file content ' + Date.now());
  const tempFileName = 'test-image.jpg';
  const tempKey = await uploadTempFile(fakeBuffer, tempFileName);
  console.log(`✅ Файл загружен во временное хранилище: ${tempKey}`);

  // 2. Вызов createNewAppeal (Симуляция завершения мастера создания)
  console.log('\n--- Шаг 2: Создание обращения через BotCoreService ---');
  const userId = 'user_test_flow_' + Date.now();
  const description = 'Тестовое описание обращения с вложением';

  const appealId = await botCoreService.createNewAppeal(userId, description, [
    tempKey,
  ]);
  console.log(`✅ Обращение создано с ID: ${appealId}`);

  // 3. Проверка DynamoDB
  console.log('\n--- Шаг 3: Проверка записи в DynamoDB ---');
  try {
    const dbResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: appealId },
      }),
    );

    if (dbResult.Item) {
      console.log('✅ Запись найдена в DynamoDB:', dbResult.Item);

      if (dbResult.Item.attachments && dbResult.Item.attachments.length > 0) {
        console.log('✅ Вложения записаны в БД:', dbResult.Item.attachments);

        // 4. Проверка S3 (что файл реально переместился)
        console.log('\n--- Шаг 4: Проверка перемещения файла в S3 ---');
        const newKey = dbResult.Item.attachments[0];

        // Инициализируем клиент для проверки (так как s3Service не экспортирует клиент)
        const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost';
        const minioPort = process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : 9000;
        const minioUseSSL = process.env.MINIO_USE_SSL === 'true';
        const protocol = minioUseSSL ? 'https://' : 'http://';

        const endpoint = process.env.MINIO_ENDPOINT?.startsWith('http')
          ? process.env.MINIO_ENDPOINT
          : `${protocol}${minioEndpoint}:${minioPort}`;

        const s3Check = new S3Client({
          endpoint,
          region: process.env.MINIO_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
          },
          forcePathStyle: true,
        });

        try {
          await s3Check.send(
            new HeadObjectCommand({
              Bucket: process.env.S3_BUCKET!,
              Key: newKey,
            }),
          );
          console.log(`✅ Файл успешно найден по новому пути: ${newKey}`);

          // 5. Скачивание файла из MinIO и проверка содержимого
          console.log(
            '\n--- Шаг 5: Скачивание и проверка содержимого файла ---',
          );
          try {
            const { GetObjectCommand } = await import('@aws-sdk/client-s3');
            const getResult = await s3Check.send(
              new GetObjectCommand({
                Bucket: process.env.S3_BUCKET!,
                Key: newKey,
              }),
            );

            // Преобразуем stream в buffer
            const chunks: Uint8Array[] = [];
            if (getResult.Body) {
              const stream = getResult.Body as any;
              for await (const chunk of stream) {
                chunks.push(chunk);
              }
            }
            const downloadedBuffer = Buffer.concat(chunks);

            // Сравниваем с оригиналом
            if (downloadedBuffer.equals(fakeBuffer)) {
              console.log('✅ Содержимое файла совпадает с оригиналом');
              console.log(`📊 Размер файла: ${downloadedBuffer.length} байт`);
            } else {
              console.error('❌ Содержимое файла НЕ совпадает с оригиналом!');
            }
          } catch (downloadError) {
            console.error('❌ Ошибка при скачивании файла:', downloadError);
          }
        } catch (s3Error) {
          console.error(`❌ Файл НЕ найден по новому пути: ${newKey}`, s3Error);
        }
      } else {
        console.error('❌ Вложения отсутствуют в записи БД');
      }
    } else {
      console.error('❌ Запись НЕ найдена в DynamoDB');
    }
  } catch (dbError) {
    console.error('❌ Ошибка при чтении из DynamoDB:', dbError);
  }

  console.log('\n🏁 Тест завершен');
}

testFullFlow().catch(console.error);

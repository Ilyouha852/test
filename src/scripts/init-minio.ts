import 'dotenv/config';

import {
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || '',
    secretAccessKey: process.env.MINIO_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

const bucketName = process.env.S3_BUCKET || 'support-bot-files';

async function init() {
  console.log(`Проверка бакета: ${bucketName}...`);
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`✅ Бакет ${bucketName} уже существует.`);
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      console.log(`Бакет ${bucketName} не найден. Создание...`);
      try {
        await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
        console.log(`✅ Бакет ${bucketName} успешно создан.`);
      } catch (createError) {
        console.error('❌ Не удалось создать бакет:', createError);
      }
    } else {
      console.error('❌ Ошибка проверки бакета:', error);
    }
  }
}

init();

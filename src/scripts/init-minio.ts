import 'dotenv/config';

import {
    CreateBucketCommand,
    HeadBucketCommand,
    S3Client,
} from '@aws-sdk/client-s3';

const minioEndpoint = process.env.MINIO_ENDPOINT || 'localhost';
const minioPort = process.env.MINIO_PORT
    ? Number(process.env.MINIO_PORT)
    : 9000;
const minioUseSSL = process.env.MINIO_USE_SSL === 'true';
const protocol = minioUseSSL ? 'https://' : 'http://';

const endpoint = process.env.MINIO_ENDPOINT?.startsWith('http')
    ? process.env.MINIO_ENDPOINT
    : `${protocol}${minioEndpoint}:${minioPort}`;

const s3 = new S3Client({
    endpoint,
    region: process.env.MINIO_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
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
        if (
            error.name === 'NotFound' ||
            error.$metadata?.httpStatusCode === 404
        ) {
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

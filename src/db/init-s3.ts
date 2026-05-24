import {
    CreateBucketCommand,
    HeadBucketCommand,
    S3Client,
} from '@aws-sdk/client-s3';

const minioEndpoint = process.env.MINIO_ENDPOINT || process.env.S3_ENDPOINT || 'localhost';
const minioPort = process.env.MINIO_PORT
    ? Number(process.env.MINIO_PORT)
    : 9000;
const minioUseSSL = process.env.MINIO_USE_SSL === 'true';
const protocol = minioUseSSL ? 'https://' : 'http://';

export const endpoint =
    process.env.MINIO_ENDPOINT?.startsWith('http') ||
    process.env.S3_ENDPOINT?.startsWith('http')
        ? (process.env.MINIO_ENDPOINT || process.env.S3_ENDPOINT)
        : `${protocol}${minioEndpoint}:${minioPort}`;

export const bucket =
    process.env.MINIO_BUCKET ||
    process.env.S3_BUCKET ||
    'support-bot-files';

export const s3Client = new S3Client({
    endpoint: endpoint!,
    region:
        process.env.MINIO_REGION ||
        process.env.AWS_REGION ||
        'us-east-1',
    credentials: {
        accessKeyId:
            process.env.MINIO_ACCESS_KEY ||
            process.env.AWS_ACCESS_KEY_ID ||
            'minioadmin',
        secretAccessKey:
            process.env.MINIO_SECRET_KEY ||
            process.env.AWS_SECRET_ACCESS_KEY ||
            'minioadmin',
    },
    forcePathStyle: true,
});

/**
 * Проверяет, существует ли бакет S3/MinIO, и создает его при необходимости.
 * Если S3 недоступен — приложение продолжает работу, но выводит предупреждение.
 */
export async function initS3(): Promise<void> {
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
        console.log(`✅ S3 bucket "${bucket}" готов`);
    } catch (err: any) {
        const status = err.$metadata?.httpStatusCode;
        if (
            err.name === 'NotFound' ||
            status === 404 ||
            status === 403
        ) {
            try {
                await s3Client.send(
                    new CreateBucketCommand({ Bucket: bucket }),
                );
                console.log(
                    `✅ S3 bucket "${bucket}" создан`,
                );
            } catch (createErr: any) {
                console.warn(
                    `⚠️ Не удалось создать бакет "${bucket}":`,
                    createErr.message,
                );
            }
        } else {
            console.warn(
                `⚠️ S3/MinIO недоступен по адресу ${endpoint}:`,
                err.message,
            );
            console.warn(
                '   Загрузка файлов будет недоступна. Убедитесь, что MinIO запущен.',
            );
        }
    }
}

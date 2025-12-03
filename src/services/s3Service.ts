import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import * as Minio from 'minio';

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || '',
    secretAccessKey: process.env.MINIO_SECRET_KEY || '',
  },
  forcePathStyle: true, // важно для MinIO
});

export const uploadTempFile = async (fileBuffer: Buffer, fileName: string) => {
  const tempKey = `temp/${Date.now()}-${fileName}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: tempKey,
      Body: fileBuffer,
    }),
  );
  return tempKey;
};

export const moveTempToAppeal = async (tempKey: string, appealId: string) => {
  const newKey = `appeals/${appealId}/${tempKey.split('/').pop()}`;
  await s3.send(
    new CopyObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      CopySource: `${process.env.S3_BUCKET}/${tempKey}`,
      Key: newKey,
    }),
  );
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: tempKey,
    }),
  );
  return newKey;
};

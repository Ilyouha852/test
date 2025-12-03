import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isLocal = process.env.NODE_ENV !== 'production';

console.log('🔧 DynamoDB Configuration:', {
  isLocal,
  endpoint: isLocal ? 'http://localhost:8000' : undefined,
  NODE_ENV: process.env.NODE_ENV,
});

export const dynamoDBClient = new DynamoDBClient({
  endpoint: isLocal ? 'http://localhost:8000' : undefined,
  region: isLocal ? 'us-east-1' : process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fake',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fake',
  },
} as any);

export const docClient = DynamoDBDocumentClient.from(dynamoDBClient);
export const TABLE_NAME = process.env.DYNAMODB_TABLE || 'support-bot-table';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Конфигурация для локальной DynamoDB
const isLocal = process.env.NODE_ENV !== 'production';

export const dynamoDBClient = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || (isLocal ? 'http://localhost:8000' : undefined),
  region: process.env.DYNAMODB_REGION || (isLocal ? 'us-east-1' : process.env.AWS_REGION || 'us-east-1'),
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fake',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fake',
  },
});

export const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const TABLE_NAME = process.env.DYNAMODB_TABLE || 'support-bot-table';

export default {
  client: dynamoDBClient,
  docClient,
  tableName: TABLE_NAME,
};
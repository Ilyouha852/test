import {
    CreateTableCommand,
    DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB Client
// Initialize DynamoDB Client
const dynamoDBClient = new DynamoDBClient({
    region: process.env.DYNAMODB_REGION || process.env.AWS_REGION || 'us-east-1',
    ...(process.env.DYNAMODB_ENDPOINT ? { endpoint: process.env.DYNAMODB_ENDPOINT } : {}),
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    },
});

// Create DocumentClient for easier operations
export const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export { dynamoDBClient, CreateTableCommand };

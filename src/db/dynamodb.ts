import {
    CreateTableCommand,
    DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB Client
const dynamoDBClient = new DynamoDBClient({
    region: process.env.DYNAMODB_REGION || 'us-east-1',
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
    credentials:
        process.env.NODE_ENV !== 'production' &&
            !process.env.AWS_ACCESS_KEY_ID
            ? {
                accessKeyId: 'test',
                secretAccessKey: 'test',
            }
            : undefined,
});

// Create DocumentClient for easier operations
export const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export { dynamoDBClient, CreateTableCommand };

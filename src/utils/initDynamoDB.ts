import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { dynamoDBClient, TABLE_NAME } from '../config/dynamodb.js';

export async function initDynamoDB() {
  try {
    console.log('🔧 Initializing DynamoDB table...');

    const command = new CreateTableCommand({
      TableName: TABLE_NAME,
      AttributeDefinitions: [
        {
          AttributeName: 'pk',  // ← МЕНЯЕМ id на pk
          AttributeType: 'S',
        },
        {
          AttributeName: 'sk',  // ← ДОБАВЛЯЕМ sk
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'pk',  // ← МЕНЯЕМ id на pk
          KeyType: 'HASH',
        },
        {
          AttributeName: 'sk',  // ← ДОБАВЛЯЕМ RANGE ключ
          KeyType: 'RANGE',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    });

    await dynamoDBClient.send(command);
    console.log('✅ DynamoDB table created successfully!');
  } catch (error: any) {
    if (error.name === 'ResourceInUseException') {
      console.log('ℹ️ DynamoDB table already exists');
    } else {
      console.error('❌ Error creating DynamoDB table:', error.message);
    }
  }
}
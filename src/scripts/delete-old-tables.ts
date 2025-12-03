import { DeleteTableCommand } from '@aws-sdk/client-dynamodb';

import { dynamoDBClient } from '../db/dynamodb.js';

const OLD_TABLES = [
    'Appeals', // Старая таблица обращений
    // Добавьте другие старые таблицы, если они есть
];

async function deleteOldTables() {
    console.log('🗑️  Deleting old DynamoDB tables...');

    for (const tableName of OLD_TABLES) {
        try {
            console.log(`📝 Deleting table: ${tableName}`);

            await dynamoDBClient.send(
                new DeleteTableCommand({ TableName: tableName }),
            );

            console.log(`✅ Table deleted: ${tableName}`);
        } catch (error: any) {
            if (error.name === 'ResourceNotFoundException') {
                console.log(`ℹ️  Table does not exist: ${tableName}`);
            } else {
                console.error(`❌ Error deleting table ${tableName}:`, error.message);
            }
        }
    }

    console.log('\n🎉 Old tables cleanup complete!');
}

deleteOldTables()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

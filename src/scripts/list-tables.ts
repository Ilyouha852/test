import 'dotenv/config';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';

const dynamodb = new DynamoDBClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
    region: process.env.DYNAMODB_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fake',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fake',
    },
});

async function listTables() {
    try {
        const command = new ListTablesCommand({});
        const result = await dynamodb.send(command);
        console.log('Доступные таблицы:');
        if (result.TableNames && result.TableNames.length > 0) {
            for (const name of result.TableNames) console.log(`- ${name}`);
        } else {
            console.log('Таблицы не найдены');
        }
    } catch (error) {
        console.error('Ошибка при получении списка таблиц:', error);
    }
}

listTables();

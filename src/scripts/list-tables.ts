import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';

const dynamodb = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
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

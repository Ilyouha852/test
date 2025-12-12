import { dynamoDBClient } from '../db/dynamodb.js';
import { ListTablesCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

async function checkTables() {
    try {
        // 1. Проверьте все таблицы
        const listCommand = new ListTablesCommand({});
        const tables = await dynamoDBClient.send(listCommand);
        console.log('📊 Все таблицы в DynamoDB:');
        console.log(tables.TableNames);

        // 2. Проверьте конкретную таблицу
        const tableName = 'support_bot_user_states';
        if (tables.TableNames?.includes(tableName)) {
            console.log(`\n✅ Таблица "${tableName}" существует`);
            
            const describeCommand = new DescribeTableCommand({
                TableName: tableName
            });
            const tableInfo = await dynamoDBClient.send(describeCommand);
            console.log('Структура таблицы:', JSON.stringify(tableInfo.Table, null, 2));
        } else {
            console.log(`\n❌ Таблица "${tableName}" НЕ существует!`);
            console.log('Запустите: npx tsx src/scripts/init-all-tables.ts');
        }

        // 3. Проверьте таблицу user_snapshots (если она есть в ошибке)
        if (tables.TableNames?.includes('user_snapshots')) {
            console.log(`\n⚠️ Таблица "user_snapshots" существует, но не используется`);
        }
    } catch (error) {
        console.error('Ошибка при проверке таблиц:', error);
    }
}

checkTables();
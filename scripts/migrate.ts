import { CreateTableCommand, DeleteTableCommand, DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
const region = process.env.DYNAMODB_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || 'fake';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || 'fake';

const client = new DynamoDBClient({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
});

const BASE_TABLE = {
    BillingMode: 'PAY_PER_REQUEST' as const,
    AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' as const },
        { AttributeName: 'sk', AttributeType: 'S' as const },
    ],
    KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' as const },
        { AttributeName: 'sk', KeyType: 'RANGE' as const },
    ],
};

const tables = [
    { TableName: 'support_bot_users' },
    { TableName: 'support_bot_user_roles' },
    { TableName: 'support_bot_solutions' },
    { TableName: 'support_bot_appeal_subdivisions' },
    { TableName: 'support_bot_appeal_categories' },
    { TableName: 'support_bot_appeal_software' },
    { TableName: 'support_bot_appeal_statuses' },
    { TableName: 'support_bot_appeal_criticality' },
    { TableName: 'support_bot_user_relations' },
    { TableName: 'support_bot_chats' },
    { TableName: 'support_bot_communications' },
    { TableName: 'support_bot_messengers' },
    { TableName: 'support_bot_chat_types' },
    { TableName: 'support_bot_appeal_images' },
    { TableName: 'support_bot_user_states' },
    { TableName: 'support_bot_support_staff' },
    { TableName: 'support_bot_appeals' },
    {
        TableName: 'support_bot_appeal_users',
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' as const },
            { AttributeName: 'sk', AttributeType: 'S' as const },
            { AttributeName: 'userId', AttributeType: 'S' as const },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'UserAppealsIndex',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' as const },
                ],
                Projection: { ProjectionType: 'ALL' as const },
            },
        ],
    },
];

async function getExistingTables(): Promise<Set<string>> {
    const result = await client.send(new ListTablesCommand({}));
    return new Set(result.TableNames || []);
}

async function createTable(tableConfig: typeof tables[number]): Promise<void> {
    const params = {
        ...BASE_TABLE,
        ...tableConfig,
        AttributeDefinitions: tableConfig.AttributeDefinitions ?? BASE_TABLE.AttributeDefinitions,
    };

    try {
        await client.send(new CreateTableCommand(params as any));
        console.log(`✅ Таблица создана: ${tableConfig.TableName}`);
    } catch (error: any) {
        if (error.name === 'ResourceInUseException') {
            console.log(`⏭️  Таблица уже существует: ${tableConfig.TableName}`);
        } else {
            throw error;
        }
    }
}

async function migrate(drop = false): Promise<void> {
    console.log(`\n🔌 Подключение к DynamoDB: ${endpoint}\n`);

    const existing = await getExistingTables();

    if (drop) {
        console.log('🗑️  Удаление существующих таблиц...\n');
        for (const table of tables) {
            if (existing.has(table.TableName)) {
                await client.send(new DeleteTableCommand({ TableName: table.TableName }));
                console.log(`🗑️  Удалена: ${table.TableName}`);
            }
        }
        console.log('');
    }

    console.log('📦 Создание таблиц...\n');
    for (const table of tables) {
        await createTable(table);
    }

    console.log('\n✅ Миграция завершена!\n');
}

const drop = process.argv.includes('--drop');
migrate(drop).catch(error => {
    console.error('❌ Ошибка миграции:', error);
    process.exit(1);
});

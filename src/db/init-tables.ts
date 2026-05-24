import { CreateTableCommand, type CreateTableCommandInput, DescribeTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';

import { dynamoDBClient } from './dynamodb.js';
import { TABLE_NAMES } from './types.js';

async function waitForDynamo(retries = 60, delayMs = 1000): Promise<void> {
    for (let i = 0; i < retries; i++) {
        try {
            await dynamoDBClient.send(new ListTablesCommand({}));
            return;
        } catch {
            if (i === 0) console.log('⏳ Waiting for DynamoDB Local to be ready...');
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
    throw new Error('DynamoDB Local did not start in time');
}

async function tableExists(tableName: string): Promise<boolean> {
    try {
        await dynamoDBClient.send(new DescribeTableCommand({ TableName: tableName }));
        return true;
    } catch {
        return false;
    }
}


async function createTableIfNotExists(params: CreateTableCommandInput) {
    const tableName = params.TableName!;
    if (await tableExists(tableName)) {
        console.log(`  ✓ ${tableName}`);
        return;
    }
    await dynamoDBClient.send(new CreateTableCommand(params));
    console.log(`  ✓ ${tableName} (created)`);
}

function stdTable(
    name: string,
    extraGSIs: { attrName: string; attrType: string; indexName: string; keyType?: string }[] = [],
) {
    const attrDefs = [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
    ];
    for (const g of extraGSIs) {
        if (!attrDefs.find(a => a.AttributeName === g.attrName)) {
            attrDefs.push({ AttributeName: g.attrName, AttributeType: g.attrType });
        }
    }
    const gsIndexes = extraGSIs.map(g => ({
        IndexName: g.indexName,
        KeySchema: [{ AttributeName: g.attrName, KeyType: g.keyType || 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
    }));

    return {
        TableName: name,
        BillingMode: 'PAY_PER_REQUEST' as const,
        AttributeDefinitions: attrDefs,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' as const },
            { AttributeName: 'sk', KeyType: 'RANGE' as const },
        ],
        GlobalSecondaryIndexes: gsIndexes.length > 0 ? gsIndexes : undefined,
    };
}

export async function initTables(): Promise<void> {
    console.log('📦 Checking DynamoDB tables...');

    const tables = [
        // Reference tables (no GSIs)
        stdTable(TABLE_NAMES.USER_ROLES),
        stdTable(TABLE_NAMES.APPEAL_SUBDIVISIONS),
        stdTable(TABLE_NAMES.APPEAL_CATEGORIES),
        stdTable(TABLE_NAMES.APPEAL_SOFTWARE),
        stdTable(TABLE_NAMES.APPEAL_STATUSES),
        stdTable(TABLE_NAMES.APPEAL_CRITICALITY),
        stdTable(TABLE_NAMES.USER_RELATIONS),
        stdTable(TABLE_NAMES.MESSENGERS),
        stdTable(TABLE_NAMES.CHAT_TYPES),
        stdTable(TABLE_NAMES.SOLUTIONS),

        // Users
        stdTable(TABLE_NAMES.USERS, [
            { attrName: 'email', attrType: 'S', indexName: 'EmailIndex' },
            { attrName: 'roleId', attrType: 'S', indexName: 'RoleIndex' },
        ]),

        // Appeals
        stdTable(TABLE_NAMES.APPEALS, [
            { attrName: 'appealStatusId', attrType: 'S', indexName: 'StatusIndex' },
            { attrName: 'appealCategoryId', attrType: 'S', indexName: 'CategoryIndex' },
        ]),

        // Appeal Users (appealId + sk PK; userId GSI)
        {
            TableName: TABLE_NAMES.APPEAL_USERS,
            BillingMode: 'PAY_PER_REQUEST',
            AttributeDefinitions: [
                { AttributeName: 'appealId', AttributeType: 'S' },
                { AttributeName: 'sk', AttributeType: 'S' },
                { AttributeName: 'userId', AttributeType: 'S' },
            ],
            KeySchema: [
                { AttributeName: 'appealId', KeyType: 'HASH' },
                { AttributeName: 'sk', KeyType: 'RANGE' },
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'UserAppealsIndex',
                    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
                    Projection: { ProjectionType: 'ALL' },
                },
            ],
        },

        // Chats
        stdTable(TABLE_NAMES.CHATS, [
            { attrName: 'messengerId', attrType: 'S', indexName: 'MessengerIndex' },
        ]),

        // Communications
        stdTable(TABLE_NAMES.COMMUNICATIONS, [
            { attrName: 'chatId', attrType: 'S', indexName: 'ChatIndex' },
            { attrName: 'userId', attrType: 'S', indexName: 'UserIndex' },
        ]),

        // Appeal Images (appealId + sk PK; id GSI)
        {
            TableName: TABLE_NAMES.APPEAL_IMAGES,
            BillingMode: 'PAY_PER_REQUEST',
            AttributeDefinitions: [
                { AttributeName: 'appealId', AttributeType: 'S' },
                { AttributeName: 'sk', AttributeType: 'S' },
                { AttributeName: 'id', AttributeType: 'S' },
            ],
            KeySchema: [
                { AttributeName: 'appealId', KeyType: 'HASH' },
                { AttributeName: 'sk', KeyType: 'RANGE' },
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'ImageIndex',
                    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
                    Projection: { ProjectionType: 'ALL' },
                },
            ],
        },

        stdTable(TABLE_NAMES.USER_STATES),
        stdTable(TABLE_NAMES.SUPPORT_STAFF),

    ];

    for (const table of tables) {
        await createTableIfNotExists(table as CreateTableCommandInput);
    }

    console.log('✅ All tables ready');
}

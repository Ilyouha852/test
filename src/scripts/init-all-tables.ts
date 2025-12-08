import 'dotenv/config';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';

import { dynamoDBClient } from '../db/dynamodb.js';
import { TABLE_NAMES } from '../db/types.js';

// Table definitions with GSIs
const tableDefinitions = [
    // 1. Users Table
    {
        TableName: TABLE_NAMES.USERS,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
            { AttributeName: 'email', AttributeType: 'S' },
            { AttributeName: 'roleId', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'EmailIndex',
                KeySchema: [
                    { AttributeName: 'email', KeyType: 'HASH' },
                    { AttributeName: 'id', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
            {
                IndexName: 'RoleIndex',
                KeySchema: [
                    { AttributeName: 'roleId', KeyType: 'HASH' },
                    { AttributeName: 'createdAt', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
        ],
        BillingMode: 'PAY_PER_REQUEST',
    },

    // 2. UserRoles Table
    {
        TableName: TABLE_NAMES.USER_ROLES,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
            { AttributeName: 'name', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'NameIndex',
                KeySchema: [{ AttributeName: 'name', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' },
            },
        ],
        BillingMode: 'PAY_PER_REQUEST',
    },

    // 3. Appeals Table
    {
        TableName: TABLE_NAMES.APPEALS,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
            { AttributeName: 'appealStatusId', AttributeType: 'S' },
            { AttributeName: 'appealCategoryId', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'StatusIndex',
                KeySchema: [
                    { AttributeName: 'appealStatusId', KeyType: 'HASH' },
                    { AttributeName: 'createdAt', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
            {
                IndexName: 'CategoryIndex',
                KeySchema: [
                    { AttributeName: 'appealCategoryId', KeyType: 'HASH' },
                    { AttributeName: 'createdAt', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
        ],
        BillingMode: 'PAY_PER_REQUEST',
    },

    // 4. AppealUsers Table (Many-to-Many)
    {
        TableName: TABLE_NAMES.APPEAL_USERS,
        KeySchema: [
            { AttributeName: 'appealId', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'appealId', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'relationId', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'UserAppealsIndex',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' },
                    { AttributeName: 'appealId', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
            {
                IndexName: 'RelationIndex',
                KeySchema: [
                    { AttributeName: 'relationId', KeyType: 'HASH' },
                    { AttributeName: 'appealId', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
        ],
        BillingMode: 'PAY_PER_REQUEST',
    },

    // 5. Solutions Table
    {
        TableName: TABLE_NAMES.SOLUTIONS,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
    },

    // 6-11. Reference Tables (same pattern)
    ...[
        TABLE_NAMES.APPEAL_SUBDIVISIONS,
        TABLE_NAMES.APPEAL_CATEGORIES,
        TABLE_NAMES.APPEAL_SOFTWARE,
        TABLE_NAMES.APPEAL_STATUSES,
        TABLE_NAMES.APPEAL_CRITICALITY,
        TABLE_NAMES.USER_RELATIONS,
    ].map((tableName) => ({
        TableName: tableName,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
            { AttributeName: 'name', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'NameIndex',
                KeySchema: [{ AttributeName: 'name', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' },
            },
        ],
        BillingMode: 'PAY_PER_REQUEST',
    })),

    // 12. Chats Table
    {
        TableName: TABLE_NAMES.CHATS,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
            { AttributeName: 'messengerId', AttributeType: 'S' },
            { AttributeName: 'chatTypeId', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'MessengerIndex',
                KeySchema: [
                    { AttributeName: 'messengerId', KeyType: 'HASH' },
                    { AttributeName: 'createdAt', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
            {
                IndexName: 'ChatTypeIndex',
                KeySchema: [
                    { AttributeName: 'chatTypeId', KeyType: 'HASH' },
                    { AttributeName: 'createdAt', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
        ],
        BillingMode: 'PAY_PER_REQUEST',
    },

    // 13. Communications Table
    {
        TableName: TABLE_NAMES.COMMUNICATIONS,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
            { AttributeName: 'chatId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'ChatIndex',
                KeySchema: [
                    { AttributeName: 'chatId', KeyType: 'HASH' },
                    { AttributeName: 'id', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
            {
                IndexName: 'UserIndex',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' },
                    { AttributeName: 'chatId', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
        ],
        BillingMode: 'PAY_PER_REQUEST',
    },

    // 14. Messengers Table
    {
        TableName: TABLE_NAMES.MESSENGERS,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
            { AttributeName: 'name', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'NameIndex',
                KeySchema: [{ AttributeName: 'name', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' },
            },
        ],
        BillingMode: 'PAY_PER_REQUEST',
    },

    // 15. ChatTypes Table
    {
        TableName: TABLE_NAMES.CHAT_TYPES,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
            { AttributeName: 'name', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'NameIndex',
                KeySchema: [{ AttributeName: 'name', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' },
            },
        ],
        BillingMode: 'PAY_PER_REQUEST',
    },

    // 16. AppealImages Table
    {
        TableName: TABLE_NAMES.APPEAL_IMAGES,
        KeySchema: [
            { AttributeName: 'appealId', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'appealId', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
            { AttributeName: 'id', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'ImageIndex',
                KeySchema: [
                    { AttributeName: 'id', KeyType: 'HASH' },
                    { AttributeName: 'appealId', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
        ],
        BillingMode: 'PAY_PER_REQUEST',
    },

    // 17. UserStates Table (for XState snapshots)
    {
        TableName: TABLE_NAMES.USER_STATES,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'machineType', AttributeType: 'S' },
            { AttributeName: 'currentState', AttributeType: 'S' },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'UserIdIndex',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
            {
                IndexName: 'MachineTypeIndex',
                KeySchema: [
                    { AttributeName: 'machineType', KeyType: 'HASH' },
                    { AttributeName: 'currentState', KeyType: 'RANGE' },
                ],
                Projection: { ProjectionType: 'ALL' },
            },
        ],
        BillingMode: 'PAY_PER_REQUEST',
    },
];

export async function initAllTables() {
    console.log('🔧 Initializing all DynamoDB tables...');
    console.log('  Endpoint:', process.env.DYNAMODB_ENDPOINT);
    console.log('  Region:', process.env.DYNAMODB_REGION);
    console.log('  AccessKey:', process.env.AWS_ACCESS_KEY_ID ? '***' : 'undefined');

    const results = {
        created: [] as string[],
        exists: [] as string[],
        errors: [] as { table: string; error: string }[],
    };

    for (const tableDef of tableDefinitions) {
        try {
            console.log(`📝 Creating table: ${tableDef.TableName}`);
            await dynamoDBClient.send(new CreateTableCommand(tableDef as any));
            results.created.push(tableDef.TableName);
            console.log(`✅ Table created: ${tableDef.TableName}`);
        } catch (error: any) {
            if (error.name === 'ResourceInUseException') {
                results.exists.push(tableDef.TableName);
                console.log(`ℹ️  Table already exists: ${tableDef.TableName}`);
            } else {
                results.errors.push({
                    table: tableDef.TableName,
                    error: error.message,
                });
                console.error(
                    `❌ Error creating table ${tableDef.TableName}:`,
                    JSON.stringify(error, null, 2),
                );
            }
        }
    }

    console.log('\n📊 Summary:');
    console.log(`  ✅ Created: ${results.created.length} tables`);
    console.log(`  ℹ️  Already exists: ${results.exists.length} tables`);
    console.log(`  ❌ Errors: ${results.errors.length} tables`);

    if (results.errors.length > 0) {
        console.log('\n❌ Failed tables:');
        results.errors.forEach(({ table, error }) => {
            console.log(`  - ${table}: ${error}`);
        });
    }

    console.log('\n🎉 Table initialization complete!');
    return results;
}

// Run unconditionally
initAllTables()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

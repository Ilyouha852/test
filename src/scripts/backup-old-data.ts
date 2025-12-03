import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { writeFileSync } from 'fs';

import { docClient } from '../db/dynamodb.js';

async function backupOldData() {
    console.log('📦 Creating backup of old data...');

    const oldTableName = process.env.DYNAMO_TABLE || 'Appeals';

    try {
        const result = await docClient.send(
            new ScanCommand({ TableName: oldTableName }),
        );

        const backup = {
            tableName: oldTableName,
            timestamp: new Date().toISOString(),
            itemCount: result.Items?.length || 0,
            items: result.Items || [],
        };

        const filename = `backup-${oldTableName}-${Date.now()}.json`;
        writeFileSync(filename, JSON.stringify(backup, null, 2));

        console.log(`✅ Backup saved to: ${filename}`);
        console.log(`📊 Backed up ${backup.itemCount} items`);
    } catch (error) {
        console.error('❌ Backup failed:', error);
    }
}

backupOldData()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

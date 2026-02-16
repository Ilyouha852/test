import { initDynamoDb } from '../utils/init-dynamo-db.js';

(async () => {
    try {
        await initDynamoDb();
        console.log('Init finished');
    } catch (error) {
        console.error('Init failed:', error);
        process.exit(1);
    }
})();

import { initDynamoDB } from '../utils/initDynamoDB.js';

(async () => {
    try {
        await initDynamoDB();
        console.log('Init finished');
    } catch (error) {
        console.error('Init failed:', error);
        process.exit(1);
    }
})();

// Simulate Environment setup BEFORE import
process.env.NODE_ENV = 'production';
process.env.DYNAMODB_ENDPOINT = 'http://production-db:8000';
process.env.AWS_ACCESS_KEY_ID = 'prod-key';
process.env.AWS_SECRET_ACCESS_KEY = 'prod-secret';

async function verify() {
    console.log('--- Simulating Production Environment ---');
    // Dynamically import to ensure env vars are set first
    const { dynamoDBClient } = await import('./config/dynamodb.js');

    const endpoint = await dynamoDBClient.config.endpoint();
    console.log('Resolved Endpoint:', endpoint);

    const region = await dynamoDBClient.config.region();
    console.log('Resolved Region:', region);

    if (endpoint.hostname === 'production-db' && endpoint.port === 8000) {
        console.log('✅ SUCCESS: Custom endpoint used in production mode.');
    } else {
        console.log('❌ FAILURE: Custom endpoint IGNORED in production mode.');
        console.log('Expected: production-db:8000');
        console.log('Got:', endpoint);
    }
}

verify().catch(console.error);

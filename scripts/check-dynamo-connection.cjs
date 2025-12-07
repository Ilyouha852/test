require('dotenv').config();
const {
  DynamoDBClient,
  ListTablesCommand,
} = require('@aws-sdk/client-dynamodb');

console.log('🔍 Checking DynamoDB connection...');

const client = new DynamoDBClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  region: process.env.DYNAMODB_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fake',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fake',
  },
});

async function checkConnection() {
  try {
    const command = new ListTablesCommand({});
    const result = await client.send(command);

    console.log('✅ DynamoDB connection successful!');
    console.log('📋 Available tables:', result.TableNames);
    console.log(
      '📍 Endpoint:',
      process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
    );
    console.log('🌍 Region:', process.env.DYNAMODB_REGION || 'us-east-1');
  } catch (error) {
    console.error('❌ DynamoDB connection failed:');
    console.error('   Error:', error.message);
    console.log('💡 Make sure DynamoDB Local is running:');
    console.log('   npm run db:start');
  }
}

checkConnection();

const { execSync } = require('node:child_process');

console.log('📊 Checking DynamoDB Local status...');

try {
    const output = execSync(
        'docker ps --filter "name=dynamodb-local"',
    ).toString();
    console.log(output);

    if (output.includes('dynamodb-local')) {
        console.log('✅ DynamoDB Local is running');
    } else {
        console.log('❌ DynamoDB Local is not running');
    }
} catch (error) {
    console.error('❌ Error checking status:', error.message);
}

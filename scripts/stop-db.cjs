const { execSync } = require('child_process');

console.log('🛑 Stopping DynamoDB Local...');

try {
  execSync('docker stop dynamodb-local', { stdio: 'inherit' });
  execSync('docker rm dynamodb-local', { stdio: 'inherit' });
  console.log('✅ DynamoDB Local stopped and removed successfully!');
} catch (error) {
  console.error('❌ Failed to stop DynamoDB Local:', error.message);
}
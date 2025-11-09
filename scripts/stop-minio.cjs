const { execSync } = require('child_process');
const path = require('path');

console.log('🛑 Stopping MinIO...');

try {
  execSync('docker-compose stop minio', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ MinIO stopped successfully!');
} catch (error) {
  console.error('❌ Failed to stop MinIO:', error.message);
}
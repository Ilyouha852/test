const { execSync } = require('node:child_process');
const path = require('node:path');

console.log('🛑 Stopping MinIO...');

try {
    execSync('docker-compose -f docker-compose-local.yml stop minio-bot', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
    });
    console.log('✅ MinIO stopped successfully!');
} catch (error) {
    console.error('❌ Failed to stop MinIO:', error.message);
}

const { execSync } = require('child_process');
const path = require('path');

console.log('📊 Checking MinIO status...');

try {
  const output = execSync('docker-compose ps minio', {
    cwd: path.join(__dirname, '..')
  }).toString();
  console.log(output);
  
  if (output.includes('Up')) {
    console.log('✅ MinIO is running');
    console.log('📍 Web UI: http://localhost:9001');
    console.log('🔑 Login: minioadmin / minioadmin');
  } else {
    console.log('❌ MinIO is not running');
  }
} catch (error) {
  console.error('❌ Error checking status:', error.message);
}
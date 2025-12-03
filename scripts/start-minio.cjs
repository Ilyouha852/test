const { execSync } = require('node:child_process');
const path = require('node:path');

console.log('🚀 Starting MinIO...');

try {
  // Проверяем установлен ли Docker
  execSync('docker --version', { stdio: 'ignore' });
  console.log('✅ Docker is available');
} catch {
  console.error('❌ Docker is not installed or not in PATH');
  console.log(
    '📥 Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/',
  );
  process.exit(1);
}

try {
  // Запускаем через docker-compose
  execSync('docker-compose -f docker-compose-local.yml up -d minio-bot', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });

  console.log('✅ MinIO started successfully!');
  console.log('📍 API available at: http://localhost:9000');
  console.log('🖥️  Web UI available at: http://localhost:9001');
  console.log('🔑 Credentials: minioadmin / minioadmin');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   - Open http://localhost:9001 in browser');
  console.log('   - Login with minioadmin/minioadmin');
  console.log('   - Create a bucket for your files');
} catch (error) {
  console.error('❌ Failed to start MinIO:', error.message);
  console.log('💡 If container already exists, try: npm run minio:stop first');
}

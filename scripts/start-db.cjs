const { execSync } = require('node:child_process');
const path = require('node:path');

console.log('🚀 Starting DynamoDB Local...');

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
    // Запускаем DynamoDB Local напрямую через docker run
    execSync(
        'docker run -d --name dynamodb-local -p 8000:8000 amazon/dynamodb-local',
        {
            stdio: 'inherit',
        },
    );
    console.log('✅ DynamoDB Local started successfully!');
    console.log('📍 Available at: http://localhost:8000');
} catch (error) {
    console.error('❌ Failed to start DynamoDB Local:', error.message);
    console.log('💡 If container already exists, try: npm run db:stop first');
}

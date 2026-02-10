const { execSync } = require('node:child_process');

console.log('🔧 Running system check...\n');

// Проверяем Docker
try {
    console.log('1. Checking Docker...');
    execSync('docker --version', { stdio: 'pipe' });
    console.log('   ✅ Docker is installed');
} catch {
    console.log('   ❌ Docker not found');
    console.log(
        '   💡 Install Docker Desktop from: https://www.docker.com/products/docker-desktop/',
    );
}

// Проверяем DynamoDB Local
try {
    console.log('2. Checking DynamoDB Local...');
    const output = execSync(
        'docker ps --filter "name=dynamodb-local" --format "{{.Names}}"',
    )
        .toString()
        .trim();
    if (output === 'dynamodb-local') {
        console.log('   ✅ DynamoDB Local is running');
    } else {
        console.log('   ❌ DynamoDB Local is not running');
        console.log('   💡 Start it with: npm run db:start');
    }
} catch {
    console.log('   ❌ Error checking DynamoDB');
}

// Проверяем .env файл
const fs = require('node:fs');
console.log('3. Checking environment...');
if (fs.existsSync('.env')) {
    console.log('   ✅ .env file exists');

    const environmentContent = fs.readFileSync('.env', 'utf8');
    if (environmentContent.includes('DYNAMODB')) {
        console.log('   ✅ DynamoDB configuration found');
    } else {
        console.log('   ⚠️  DynamoDB configuration missing');
    }
} else {
    console.log('   ❌ .env file not found');
    console.log('   💡 Create it with: npm run setup');
}

console.log('\n🎯 Next steps:');
console.log('   - Ensure DynamoDB is running: npm run db:start');
console.log('   - Start the server: npm run dev');
console.log('   - Test the API: curl http://localhost:3007/api/v1/counter');

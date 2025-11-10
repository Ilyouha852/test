import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PortainerDeployer {
  constructor() {
    this.portainerUrl = process.env.PORTAINER_URL;
    this.portainerApiKey = process.env.PORTAINER_API_KEY;
    this.stackId = process.env.PORTAINER_STACK_ID;
    this.endpointId = process.env.PORTAINER_ENDPOINT_ID;
    
    this.validateConfig();
  }

  validateConfig() {
    const required = [
      'PORTAINER_URL',
      'PORTAINER_API_KEY', 
      'PORTAINER_STACK_ID',
      'PORTAINER_ENDPOINT_ID'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  async deploy() {
    try {
      console.log('🚀 Starting deployment to Swarm cluster...');
      console.log(`📍 Portainer: ${this.portainerUrl}`);
      console.log(`📦 Stack ID: ${this.stackId}`);

      // 1. Читаем compose файл
      const composeFilePath = path.join(process.cwd(), 'docker-compose.swarm.yml');
      if (!fs.existsSync(composeFilePath)) {
        throw new Error(`Compose file not found: ${composeFilePath}`);
      }

      const composeFile = fs.readFileSync(composeFilePath, 'utf8');
      console.log('✅ Compose file loaded');

      // 2. Подготавливаем данные для обновления стака
      const updateData = {
        stackFileContent: composeFile,
        env: this.getEnvironmentVariables(),
        prune: true,
        pullImage: true
      };

      console.log('📤 Sending update request to Portainer...');

      // 3. Отправляем запрос на обновление стака
      const response = await axios.put(
        `${this.portainerUrl}/api/stacks/${this.stackId}?endpointId=${this.endpointId}`,
        updateData,
        {
          headers: {
            'X-API-Key': this.portainerApiKey,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 секунд таймаут
        }
      );

      console.log('✅ Deployment successful!');
      console.log('📊 Stack status:', response.data.Status);
      console.log('🔧 Stack name:', response.data.Name);

      return response.data;
    } catch (error) {
      console.error('❌ Deployment failed:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.message);
      } else {
        console.error('Error:', error.message);
      }
      throw error;
    }
  }

  getEnvironmentVariables() {
    const envVars = [
      'TAG',
      'JWT_SECRET',
      'PORT', 
      'NODE_ENV',
      'DYNAMODB_TABLE',
      'DYNAMODB_ENDPOINT',
      'DYNAMODB_REGION',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'MINIO_ENDPOINT',
      'MINIO_ACCESS_KEY',
      'MINIO_SECRET_KEY',
      'MINIO_REGION',
      'MINIO_BUCKET'
    ];

    return envVars
      .filter(key => process.env[key])
      .map(key => ({
        name: key,
        value: process.env[key]
      }));
  }
}

// Запускаем деплой если скрипт вызван напрямую
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const deployer = new PortainerDeployer();
  deployer.deploy()
    .then(() => {
      console.log('🎉 Deployment completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Deployment failed');
      process.exit(1);
    });
}

export default PortainerDeployer;
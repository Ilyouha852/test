// Тестовый скрипт для проверки конфигурации
import PortainerDeployer from './deploy-to-swarm.js';

try {
  const deployer = new PortainerDeployer();
  console.log('✅ Configuration is valid');
  console.log('📋 Environment variables loaded:');
  console.log('- PORTAINER_URL:', process.env.PORTAINER_URL ? '***' : 'MISSING');
  console.log('- PORTAINER_API_KEY:', process.env.PORTAINER_API_KEY ? '***' : 'MISSING');
  console.log('- PORTAINER_STACK_ID:', process.env.PORTAINER_STACK_ID || 'MISSING');
  console.log('- PORTAINER_ENDPOINT_ID:', process.env.PORTAINER_ENDPOINT_ID || 'MISSING');
} catch (error) {
  console.error('❌ Configuration error:', error.message);
  process.exit(1);
}
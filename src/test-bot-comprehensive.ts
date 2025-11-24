import axios from 'axios';

const API_BASE = 'http://localhost:3007/api/v1/repair-bot';

async function comprehensiveBotTests() {
  console.log('🧪 Starting Comprehensive Repair Bot Tests...\n');
  
  const testUsers = [
    'test-user-tape-' + Date.now(),     // Двигается + Не должно → Изолента
    'test-user-wd40-' + Date.now(),     // Не двигается + Не должно → WD-40
    'test-user-ok1-' + Date.now(),      // Двигается + Должно → OK
    'test-user-ok2-' + Date.now()       // Не двигается + Должно → OK
  ];

  // Тест 1: Двигается + Не должно → Изолента
  console.log('=== TEST 1: Move + Should not → Tape ===');
  await testScenario(testUsers[0], 
    ['MOVE', 'NO_SHOULD'], 
    'Используй изоленту'
  );
  
  // Тест 2: Не двигается + Не должно → WD-40
  console.log('\n=== TEST 2: Not move + Should not → WD-40 ===');
  await testScenario(testUsers[1],
    ['NOT_MOVE', 'NO_SHOULD'],
    'Используй WD-40'
  );

  // Тест 3: Двигается + Должно → OK
  console.log('\n=== TEST 3: Move + Should → OK ===');
  await testScenario(testUsers[2],
    ['MOVE', 'YES_SHOULD'],
    'Тогда всё в порядке'
  );

  // Тест 4: Не двигается + Должно → OK
  console.log('\n=== TEST 4: Not move + Should → OK ===');
  await testScenario(testUsers[3],
    ['NOT_MOVE', 'YES_SHOULD'],
    'Тогда всё в порядке'
  );

  console.log('\n🎉 ALL 4 PATHS TESTED!');
}

async function testScenario(userId: string, events: string[], expectedResult: string) {
  try {
    console.log(`👤 User: ${userId}`);
    console.log(`🔄 Path: ${events.join(' → ')}`);
    console.log(`🎯 Expected: "${expectedResult}"`);
    
    // Старт сессии
    const start = await axios.post(`${API_BASE}/sessions/${userId}/start`);
    console.log(`   ✅ Started: ${start.data.currentState}`);
    console.log(`   ❓ "${start.data.question}"`);
    
    // Посылаем события по цепочке
    let lastResponse;
    for (const eventType of events) {
      console.log(`   ➡️  Answer: ${eventType}`);
      lastResponse = await axios.post(`${API_BASE}/sessions/${userId}/event`, {
        type: eventType
      });
      console.log(`   ✅ State: ${lastResponse.data.currentState}`);
      
      if (lastResponse.data.question) {
        console.log(`   ❓ "${lastResponse.data.question}"`);
      }
      if (lastResponse.data.result) {
        console.log(`   💡 "${lastResponse.data.result}"`);
      }
    }
    
    // Проверяем результат
    if (!lastResponse?.data.result) {
      throw new Error('No result received - machine might not be in final state');
    }
    
    if (lastResponse.data.result !== expectedResult) {
      throw new Error(`Expected "${expectedResult}" but got "${lastResponse.data.result}"`);
    }
    
    console.log(`   🎉 CORRECT: "${lastResponse.data.result}"`);
    
    // Завершаем сессию
    await axios.delete(`${API_BASE}/sessions/${userId}`);
    console.log(`   ✅ Session cleaned up`);
    
  } catch (error: any) {
    console.error(`   ❌ Test failed:`, error.response?.data?.error || error.message);
    if (error.response?.data) {
      console.error('   📋 Response data:', error.response.data);
    }
  }
}

// Запуск тестов
comprehensiveBotTests().catch(console.error);
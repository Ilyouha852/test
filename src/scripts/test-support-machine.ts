import { createActor } from 'xstate';

import { supportAppealMachine } from '../machines/supportAppealMachine.js';

async function testMachine() {
  console.log('🚀 Запуск теста машины обращений поддержки');

  const actor = createActor(supportAppealMachine, {
    input: {
      appealId: 'APPEAL-123',
    },
  });

  actor.start();

  // 1. Initial State
  console.log('Текущее состояние:', actor.getSnapshot().value); // Should be 'Created'

  // 2. Take Work
  console.log('\n👉 Действие: TAKE_WORK');
  actor.send({ type: 'TAKE_WORK', userId: 'user-1', userName: 'Alice' });
  console.log('Текущее состояние:', actor.getSnapshot().value); // Should be 'In_progress'
  console.log('Контекст:', actor.getSnapshot().context);

  // 3. Start Solving
  console.log('\n👉 Действие: SOLVE');
  actor.send({ type: 'SOLVE' });
  console.log('Текущее состояние:', actor.getSnapshot().value); // Should be 'Solving'

  // 4. Submit Solution
  console.log('\n👉 Действие: SUBMIT_SOLUTION');
  actor.send({ type: 'SUBMIT_SOLUTION', text: 'Перезагрузите сервер' });
  console.log('Текущее состояние:', actor.getSnapshot().value); // Should be 'Closed'
  console.log('Контекст:', actor.getSnapshot().context);

  console.log('\n✅ Тест завершен');
}

testMachine();

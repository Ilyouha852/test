import axios from 'axios';

async function testWebhook() {
    const port = process.env.PORT || 3007;
    const host = process.env.API_HOST || 'localhost';
    const protocol = process.env.API_PROTOCOL || 'http';
    const url =
        process.env.WEBHOOK_TEST_URL ||
        `${protocol}://${host}:${port}/api/v1/webhook`;
    const appealId = 'APPEAL-TEST-001';

    console.log('🚀 Запуск теста вебхука');

    // 1. Simulate "Take Work" button click
    console.log('\n👉 Отправка Callback: TAKE_WORK');
    try {
        await axios.post(url, {
            callback_query: {
                id: 'cb1',
                from: { id: 12_345, first_name: 'Alice' },
                message: {
                    message_id: 100,
                    chat: { id: -100_123, type: 'supergroup' },
                    text: `New Appeal\nAppeal #${appealId}`,
                },
                data: 'TAKE_WORK',
            },
        });
        console.log('✅ TAKE_WORK отправлен');
    } catch (error: any) {
        console.error('❌ Не удалось отправить TAKE_WORK:', error.message);
    }

    // Wait a bit
    await new Promise(r => setTimeout(r, 1000));

    // 2. Simulate "Solve" button click
    console.log('\n👉 Отправка Callback: SOLVE');
    try {
        await axios.post(url, {
            callback_query: {
                id: 'cb2',
                from: { id: 12_345, first_name: 'Alice' },
                message: {
                    message_id: 100,
                    chat: { id: -100_123, type: 'supergroup' },
                    text: `Appeal #${appealId}\nStatus: In Progress`,
                },
                data: 'SOLVE',
            },
        });
        console.log('✅ SOLVE отправлен');
    } catch (error: any) {
        console.error('❌ Не удалось отправить SOLVE:', error.message);
    }

    // Wait a bit
    await new Promise(r => setTimeout(r, 1000));

    // 3. Simulate Text Reply (Solution)
    console.log('\n👉 Отправка сообщения: Текст решения');
    try {
        await axios.post(url, {
            message: {
                message_id: 102,
                from: { id: 12_345, first_name: 'Alice' },
                chat: { id: -100_123, type: 'supergroup' },
                text: 'Вы пробовали выключить и включить снова?',
                reply_to_message: {
                    message_id: 100,
                    text: `Appeal #${appealId}`,
                },
            },
        });
        console.log('✅ Решение отправлено');
    } catch (error: any) {
        console.error('❌ Не удалось отправить решение:', error.message);
    }
}

testWebhook();

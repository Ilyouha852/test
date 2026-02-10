import 'dotenv/config';

import { MockConnector } from '../modules/messenger-aggregator/connectors/mock-connector.js';
import { messengerAggregator } from '../modules/messenger-aggregator/messenger-aggregator.js';
import { WebServer } from '../modules/messenger-aggregator/web-server.js';
import { initDynamoDb } from '../utils/init-dynamo-db.js';

/**
 * End-to-end test for complete webhook processing cycle
 * Tests: WebServer -> MainBotController -> State Machine -> Response
 */
async function testFullWebhookCycle() {
    console.log('🧪 Testing Full Webhook Processing Cycle\n');

    // Step 1: Initialize DynamoDB
    console.log('--- Step 1: Initialize DynamoDB ---');
    await initDynamoDb();

    // Step 2: Setup infrastructure
    console.log('\n--- Step 2: Setup MessengerAggregator and WebServer ---');
    const mockConnector = new MockConnector();
    messengerAggregator.registerConnector(mockConnector);

    const webServer = new WebServer(messengerAggregator);
    const port = Number(process.env.BOT_PORT) || 3008; // Use different port for testing
    webServer.start(port);
    console.log(`✅ WebServer started on port ${port}`);

    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Step 3: Send first message (new user)
    console.log('\n--- Step 3: Send первое сообщение (новый пользователь) ---');
    const testUserId = 'test_user_' + Date.now();
    const response1 = await fetch(`http://localhost:${port}/user_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: 'Привет',
            sender_nick: testUserId,
            chat_id: '12345',
        }),
    });

    const result1 = await response1.json();
    console.log(`Response 1:`, result1);

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Send OPEN_LIST command
    console.log('\n--- Step 4: Send OPEN_LIST command ---');
    const response2 = await fetch(`http://localhost:${port}/user_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: 'OPEN_LIST',
            sender_nick: testUserId,
            chat_id: '12345',
        }),
    });

    const result2 = await response2.json();
    console.log(`Response 2:`, result2);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Send CREATE command
    console.log('\n--- Step 5: Send OPEN_CREATE command ---');
    const response3 = await fetch(`http://localhost:${port}/user_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: 'СОЗДАТЬ',
            sender_nick: testUserId,
            chat_id: '12345',
        }),
    });

    const result3 = await response3.json();
    console.log(`Response 3:`, result3);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 6: Send BACK command
    console.log('\n--- Step 6: Send BACK command ---');
    const response4 = await fetch(`http://localhost:${port}/user_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: 'НАЗАД',
            sender_nick: testUserId,
            chat_id: '12345',
        }),
    });

    const result4 = await response4.json();
    console.log(`Response 4:`, result4);

    console.log(
        '\n🎉 Test completed! Check console output above for state transitions.',
    );
    console.log(
        '\nExpected flow: welcome -> listAppeals -> createAppeal -> welcome',
    );

    // Cleanup
    process.exit(0);
}

// Run test
testFullWebhookCycle().catch(console.error);

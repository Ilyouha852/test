import type { Connector } from '../interfaces/Connector.js';
import type { UnifiedMessage } from '../types.js';

export class MockConnector implements Connector {
    name = 'mock-connector';

    async parse(payload: any): Promise<UnifiedMessage | null> {
        console.log('MockConnector парсит сообщение', payload);
        if (!payload.text) {
            return null;
        }

        return {
            id: `msg_${Date.now()}`,
            source: this.name,
            userId: payload.sender_nick
                ? `user_${payload.sender_nick}`
                : 'user_123',
            userName: payload.sender_nick || 'Тестовый Пользователь',
            chatId: payload.chat_id || 'chat_123',
            content: payload.text,
            type: 'text',
            timestamp: new Date(),
            attachments: payload.attachments || [],
        };
    }

    async sendMessage(chatId: string, content: string): Promise<void> {
        console.log(
            `[MockConnector] Отправка сообщения в ${chatId}: "${content}"`,
        );
    }
}

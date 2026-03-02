import type { Connector } from '../interfaces/connector.js';
import type { UnifiedMessage } from '../types.js';

export class MockConnector implements Connector {
    name = 'mock-connector';

    async parse(payload: any): Promise<UnifiedMessage | undefined> {
        console.log('MockConnector парсит сообщение', payload);
        if (!payload.text) {
            return undefined;
        }

        return {
            user_id: payload.user_id,
            button: payload.button,
            place: {
                chat_id: payload.chat_id,
                message_id: payload.message_id,
            },
            name: payload.name,
            text: payload.text,
            attachments_base64: payload.attachments_base64,
            date_time: payload.date_time,
        };
    }

    async sendMessage(chatId: string, content: string): Promise<void> {
        console.log(
            `[MockConnector] Отправка сообщения в ${chatId}: "${content}"`,
        );
    }
}

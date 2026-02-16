import type { Connector } from './interfaces/connector.js';
import type { UnifiedMessage } from './types.js';

type MessageHandler = (message: UnifiedMessage) => void;

export class MessengerAggregator {
    private connectors: Map<string, Connector> = new Map();
    private messageHandlers: MessageHandler[] = [];

    /**
     * Регистрация нового коннектора (например, Telegram, WhatsApp)
     */
    registerConnector(connector: Connector) {
        if (this.connectors.has(connector.name)) {
            console.warn(
                `Коннектор ${connector.name} уже зарегистрирован. Перезапись.`,
            );
        }
        this.connectors.set(connector.name, connector);
        console.log(`✅ Коннектор зарегистрирован: ${connector.name}`);
    }

    /**
     * Получить зарегистрированный коннектор по имени
     */
    getConnector(name: string): Connector | undefined {
        return this.connectors.get(name);
    }

    /**
     * Обработка входящего вебхука от определенного источника
     */
    async processWebhook(
        source: string,
        payload: any,
    ): Promise<UnifiedMessage | undefined> {
        const connector = this.connectors.get(source);
        if (!connector) {
            console.error(`❌ Коннектор не найден для источника: ${source}`);
            return undefined;
        }

        try {
            const message = await connector.parse(payload);
            if (message) {
                this.notifyHandlers(message);
            }
            return message;
        } catch (error) {
            console.error(`❌ Ошибка обработки вебхука для ${source}:`, error);
            return undefined;
        }
    }

    /**
     * Подписка на входящие унифицированные сообщения
     */
    onMessage(handler: MessageHandler) {
        this.messageHandlers.push(handler);
    }

    private notifyHandlers(message: UnifiedMessage) {
        for (const handler of this.messageHandlers) {
            try {
                handler(message);
            } catch (error) {
                console.error('Ошибка в обработчике сообщения:', error);
            }
        }
    }
}

export const messengerAggregator = new MessengerAggregator();

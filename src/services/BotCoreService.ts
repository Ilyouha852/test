import type { UnifiedMessage } from '../modules/messenger-aggregator/types.js';
import { messengerAggregator } from '../modules/messenger-aggregator/MessengerAggregator.js';
import { moveTempToAppeal, uploadTempFile } from './s3Service.js'; // Предполагается, что s3Service экспортирует эти функции
import stateService from './stateService.js'; // Предполагается, что stateService существует
import { createActor } from 'xstate';
import { supportAppealMachine } from '../machines/supportAppealMachine.js';

class BotCoreService {
    constructor() {
        // Подписка на сообщения агрегатора
        messengerAggregator.onMessage(this.processMessage.bind(this));
    }

    /**
     * Обработка унифицированного сообщения из любого источника
     */
    async processMessage(message: UnifiedMessage) {
        console.log(`🧠 BotCore обрабатывает сообщение от ${message.source}: ${message.id}`);

        // 1. Обработка вложений (Сохранение в MinIO)
        if (message.attachments && message.attachments.length > 0) {
            for (const attachment of message.attachments) {
                if (attachment.buffer) {
                    try {
                        const fileName = `${message.id}_${Date.now()}.${attachment.type === 'image' ? 'jpg' : 'bin'}`;
                        const tempKey = await uploadTempFile(attachment.buffer, fileName);
                        console.log(`📁 Файл загружен в MinIO: ${tempKey}`);
                        attachment.fileId = tempKey;
                    } catch (error) {
                        console.error('❌ Не удалось загрузить вложение:', error);
                    }
                }
            }
        }

        // 2. Определение ID обращения (Бизнес-логика)
        let appealId = this.extractAppealId(message.content);

        // 3. Взаимодействие с машиной состояний
        if (appealId) {
            await this.handleAppealInteraction(appealId, message);
        } else {
            console.log('ℹ️ ID обращения не найден в сообщении.');
        }
    }

    /**
     * Извлечение ID обращения из текста
     */
    private extractAppealId(text: string): string | null {
        if (!text) return null;
        const match = text.match(/Appeal #([a-zA-Z0-9-]+)/);
        return match ? (match[1] || null) : null;
    }

    /**
     * Обработка взаимодействия с машиной состояний обращения
     */
    private async handleAppealInteraction(appealId: string, message: UnifiedMessage) {
        const actor = await this.getOrCreateSupportActor(appealId);
        const snapshot = actor.getSnapshot();

        // Пример логики: если в состоянии Solving, пересылаем ответ
        if (snapshot.value === 'Solving') {
            console.log(`🤖 Взаимодействие с обращением ${appealId} в состоянии ${snapshot.value}`);

            // Если это команда
            if (message.content.toLowerCase() === '/cancel') {
                actor.send({ type: 'CANCEL' });
            } else {
                actor.send({ type: 'SUBMIT_SOLUTION', text: message.content });
            }
        }
    }

    /**
     * Вспомогательный метод для получения или создания актора XState
     */
    private async getOrCreateSupportActor(appealId: string) {
        let userState = stateService.getUserState(appealId);

        if (!userState || !userState.actor) {
            console.log(`✨ Создание нового актора для обращения ${appealId}`);
            const actor = createActor(supportAppealMachine, {
                input: { appealId }
            });
            actor.start();

            userState = {
                actor,
                context: actor.getSnapshot().context,
                history: []
            };
            stateService.setUserState(appealId, userState);

            actor.subscribe((snapshot) => {
                const currentState = stateService.getUserState(appealId);
                if (currentState) {
                    currentState.history.push({
                        state: snapshot.value as string,
                        timestamp: new Date().toISOString()
                    });
                    currentState.context = snapshot.context;
                    stateService.setUserState(appealId, currentState);
                }
            });
        }
        return userState.actor;
    }

    /**
     * Отправка сообщения пользователю через соответствующий коннектор
     */
    async sendToUser(userId: string, source: string, content: string) {
        const connector = messengerAggregator.getConnector(source);
        if (!connector) {
            console.error(`❌ Невозможно отправить сообщение: Коннектор ${source} не найден`);
            return;
        }
        await connector.sendMessage(userId, content);
    }

    /**
     * Создание нового обращения (Полный цикл)
     */
    async createNewAppeal(userId: string, description: string, tempFileKeys: string[] = []): Promise<string> {
        // 1. Генерируем ID заранее
        const { createId } = await import('@paralleldrive/cuid2');
        const appealId = createId();

        // 2. Переносим файлы из temp в папку обращения
        const finalAttachments: string[] = [];
        for (const tempKey of tempFileKeys) {
            try {
                const newKey = await moveTempToAppeal(tempKey, appealId);
                finalAttachments.push(newKey);
                console.log(`📦 Файл перемещен: ${tempKey} -> ${newKey}`);
            } catch (error) {
                console.error(`❌ Ошибка при перемещении файла ${tempKey}:`, error);
            }
        }

        // 3. Сохраняем обращение в БД
        const { createAppeal } = await import('./dynamoService.js');
        await createAppeal({
            appealId,
            userId,
            description,
            attachments: finalAttachments
        });

        console.log(`✅ Обращение ${appealId} полностью создано.`);
        return appealId;
    }
}

export const botCoreService = new BotCoreService();

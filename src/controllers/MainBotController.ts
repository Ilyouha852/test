import type { Request, Response } from 'express';
import { createActor } from 'xstate';

import { appealRootMachine } from '../machines/mainStates.js';
import type { UnifiedMessage } from '../modules/messenger-aggregator/types.js';
import type { MessengerAggregator } from '../modules/messenger-aggregator/MessengerAggregator.js';
import stateService from '../services/stateService.js';

/**
 * MainBotController - Обрабатывает полный цикл обработки вебхуков
 *
 * Рабочий процесс:
 * 1. Получить вебхук от WebServer
 * 2. Разобрать вебхук через MessengerAggregator -> UnifiedMessage
 * 3. Извлечь userId из сообщения
 * 4. Проверить наличие снимка состояния в БД
 * 5а. Если снимок существует:
 *     - Восстановить машину состояний из снимка (userId уже в контексте)
 *     - Отправить событие машине
 *     - Actions машины выводят сообщения в консоль
 *     - Сохранить обновленный снимок
 * 5б. Если снимка нет:
 *     - Создать новую машину состояний с userId в input
 *     - Actions машины выводят приветствие в консоль
 *     - Сохранить снимок
 */
class MainBotController {
    private messengerAggregator: MessengerAggregator;

    constructor(messengerAggregator: MessengerAggregator) {
        this.messengerAggregator = messengerAggregator;
    }

    /**
     * Основной обработчик вебхуков - точка входа для всех сообщений
     */
    async handleWebhook(req: Request, res: Response): Promise<void> {
        try {
            console.log('📨 Webhook received:', req.body);

            // Шаг 1: Разобрать вебхук через MessengerAggregator
            const message = await this.messengerAggregator.processWebhook(
                req.body.source || 'mock-connector',
                req.body,
            );

            if (!message) {
                console.error('❌ Failed to parse webhook');
                res.status(400).json({ error: 'Invalid webhook payload' });
                return;
            }

            // Шаг 2: Обработать сообщение пользователя
            await this.processUserMessage(message);

            // Шаг 3: Отправить ответ об успехе
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('❌ Error handling webhook:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Обработка унифицированного сообщения - основная бизнес-логика
     */
    async processUserMessage(message: UnifiedMessage): Promise<void> {
        const userId = message.userId;
        console.log(`\n👤 Processing message from user: ${userId}`);

        try {
            // Шаг 1: Проверить наличие существующего снимка
            const snapshotMeta =
                await stateService.getUserSnapshotWithMeta(userId);

            let actor: any;

            if (snapshotMeta) {
                // Сценарий А: Восстановить из снимка
                console.log(
                    `📦 Restoring snapshot (machine: ${snapshotMeta.machineType}, state: ${snapshotMeta.currentState})`,
                );
                actor = this.restoreStateMachine(
                    snapshotMeta.snapshot,
                    snapshotMeta.machineType,
                );
            } else {
                // Сценарий Б: Создать новую машину
                console.log('🆕 Creating new state machine (appealRoot)');
                actor = this.createNewStateMachine(userId);
            }

            // Шаг 2: Выполнить действие (отправить событие машине)
            const event = this.mapMessageToEvent(message);
            console.log(`📤 Sending event to machine:`, event);
            actor.send(event);

            // Шаг 3: Дождаться стабилизации состояния (для async invoke)
            // Ждём изменения состояния или таймаут 5 секунд
            const initialState = actor.getSnapshot();
            const initialValue = JSON.stringify(initialState.value);

            await new Promise<void>(resolve => {
                let resolved = false;

                const subscription = actor.subscribe((snapshot: any) => {
                    const currentValue = JSON.stringify(snapshot.value);
                    // Если состояние изменилось и нет активных дочерних машин
                    if (currentValue !== initialValue && !resolved) {
                        resolved = true;
                        subscription.unsubscribe();
                        // Даём небольшую задержку для завершения всех side effects
                        setTimeout(() => resolve(), 50);
                    }
                });

                // Таймаут 5 секунд (для долгих DynamoDB операций)
                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        subscription.unsubscribe();
                        resolve();
                    }
                }, 5000);
            });
            // Шаг 4: Получить текущее состояние
            const currentState = actor.getSnapshot();
            const stateValue =
                typeof currentState.value === 'string'
                    ? currentState.value
                    : JSON.stringify(currentState.value);

            console.log(`📍 Current state after event: ${stateValue}`);

            // Шаг 5: Сохранить обновленный снимок в БД
            await stateService.saveUserSnapshot(userId, actor, 'appealRoot');

            console.log(
                `✅ Message processed successfully for user ${userId}\\n`,
            );
        } catch (error) {
            console.error(
                `❌ Error processing message for user ${userId}:`,
                error,
            );
        }
    }

    /**
     * Создать новый экземпляр машины состояний
     */
    private createNewStateMachine(userId: string): any {
        const actor = createActor(appealRootMachine, {
            input: { userId },
        });
        actor.start();
        return actor;
    }

    /**
     * Восстановить машину состояний из снимка
     */
    private restoreStateMachine(snapshot: any, machineType: string): any {
        // Пока поддерживается только appealRootMachine
        // В будущем можно переключаться в зависимости от machineType
        // При восстановлении из snapshot, input не требуется - контекст уже в snapshot
        const actor = createActor(appealRootMachine, {
            snapshot,
        });
        actor.start();
        return actor;
    }

    /**
     * Преобразовать UnifiedMessage в событие XState
     */
    private mapMessageToEvent(message: UnifiedMessage): any {
        const content = message.content.trim().toUpperCase();

        // Сопоставить общие текстовые команды с событиями
        const eventMap: Record<string, any> = {
            ПРИВЕТ: { type: 'START' },
            START: { type: 'START' },
            СПИСОК: { type: 'OPEN_LIST' },
            OPEN_LIST: { type: 'OPEN_LIST' },
            СОЗДАТЬ: { type: 'OPEN_CREATE' },
            OPEN_CREATE: { type: 'OPEN_CREATE' },
            CREATE: { type: 'OPEN_CREATE' },
            НАЗАД: { type: 'BACK' },
            BACK: { type: 'BACK' },
            ПОМОЩЬ: { type: 'HELP' },
            HELP: { type: 'HELP' },
            ADD_DESCRIPTION: { type: 'ADD_DESCRIPTION' },
            SELECT_CATEGORY: { type: 'SELECT_CATEGORY' },
            CHOOSE_SOFTWARE: { type: 'CHOOSE_SOFTWARE' },
            SET_CRITICALITY: { type: 'SET_CRITICALITY' },
            ATTACH_FILE: { type: 'ATTACH_FILE' },
            STOP_ATTACHING: { type: 'STOP_ATTACHING' },
            CONFIRM_CREATION: { type: 'CONFIRM_CREATION' },
            CANCEL_CREATION: { type: 'CANCEL_CREATION' },
            CONFIRM_FIXATION: { type: 'CONFIRM_FIXATION' },
            CANCEL_FIXATION: { type: 'CANCEL_FIXATION' },
        };

        // Проверить, является ли это прямой командой
        if (eventMap[content]) {
            return eventMap[content];
        }

        // Проверить, является ли это командой SELECT_APPEAL с ID
        if (content.startsWith('SELECT_APPEAL')) {
            const parts = content.split(' ');
            if (parts.length > 1) {
                return { type: 'SELECT_APPEAL', appealId: parts[1] };
            }
        }

        // По умолчанию: считать текстовым вводом (для мастеров)
        return { type: 'TEXT_INPUT', text: message.content };
    }
}

export default MainBotController;

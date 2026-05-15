import { assign, createMachine } from 'xstate';

import { getAppealById, getAppealsByStatus, updateAppeal } from '../db/tables/appeal.js';
import {
    getAppealStatusById,
    getAppealStatusByName,
} from '../db/tables/references/appeal-status.js';
import { createSolution } from '../db/tables/solution.js';
import { APPEAL_STATUS_NAMES, type AppealStatusName } from '../db/types.js';
import { updateAppealStatus } from '../services/appeal-actions.js';
import messagingService from '../services/messaging-service.js';

export interface BotChatSupportContext {
    userId: string;
    connectorName: string;
    chatId: string;
    keyboardMessageId: string | undefined;
    appealId: string | undefined;
    isAttached: boolean;
    solutionText: string | undefined;
}

export type BotChatSupportEvent =
    | { type: 'START' }
    | { type: 'SELECT_APPEAL'; appealId: string }
    | { type: 'BACK' }
    | { type: 'CHANGE_ATTACH_STATUS' }
    | { type: 'CONFIRM' }
    | { type: 'SOLVE' }
    | { type: 'SEND' }
    | { type: 'HELP' }
    | { type: 'CHANGE_STATUS_APPEAL'; statusName?: AppealStatusName }
    | { type: 'ENTER_SOLUTION_TEXT'; text: string };

export const appealRootMachine = createMachine(
    {
        id: 'appealRoot',
        initial: 'listAppeal',

        types: {} as {
            context: BotChatSupportContext;
            events: BotChatSupportEvent;
            input: { userId: string; connectorName: string; chatId: string };
        },

        context: ({ input }) => ({
            userId: input?.userId ?? '',
            connectorName: input?.connectorName ?? '',
            chatId: input?.chatId ?? '',
            keyboardMessageId: undefined,
            appealId: undefined,
            isAttached: false,
            solutionText: undefined,
        }),

        states: {
            listAppeal: {
                entry: 'showAppealList',
                on: {
                    SELECT_APPEAL: {
                        target: 'appealDetails',
                        actions: assign({
                            appealId: ({ event }) =>
                                event.type === 'SELECT_APPEAL'
                                    ? event.appealId
                                    : undefined,
                            isAttached: false,
                            solutionText: undefined,
                        }),
                    },
                    HELP: { actions: 'showHelp' },
                },
            },

            appealDetails: {
                entry: 'showAppealDetails',
                on: {
                    SOLVE: {
                        target: 'enterSolution',
                        guard: 'isUserAttached',
                    },
                    BACK: { target: 'listAppeal' },
                    CHANGE_ATTACH_STATUS: {
                        target: 'statusAttachment',
                    },
                    CHANGE_STATUS_APPEAL: {
                        actions: 'change_status',
                    },
                    HELP: {
                        actions: 'showHelp',
                    },
                },
            },

            statusAttachment: {
                entry: 'showSelectAttachment',
                on: {
                    BACK: { target: 'appealDetails' },
                    CONFIRM: {
                        target: 'appealDetails',
                        actions: ['toggleAttachStatus', 'attach'],
                    },
                },
            },

            enterSolution: {
                entry: 'showEnterSolution',
                on: {
                    ENTER_SOLUTION_TEXT: {
                        actions: assign({
                            solutionText: ({ event }) =>
                                event.type === 'ENTER_SOLUTION_TEXT'
                                    ? event.text
                                    : undefined,
                        }),
                    },
                    CONFIRM: { target: 'confirm' },
                    BACK: { target: 'appealDetails' },
                },
            },

            confirm: {
                entry: 'showConfirm',
                on: {
                    SEND: { target: 'listAppeal', actions: 'sendSolution' },
                    BACK: { target: 'enterSolution' },
                },
            },
        },
    },
    {
        guards: {
            isUserAttached: ({ context }) => {
                console.log(`[Guard isUserAttached] userId=${context.userId}, appealId=${context.appealId}, isAttached=${context.isAttached}`);
                return context.isAttached === true;
            },
            isUserNotAttached: ({ context }) => {
                console.log(`[Guard isUserNotAttached] userId=${context.userId}, appealId=${context.appealId}, isAttached=${context.isAttached}`);
                return context.isAttached === false;
            },
        },
        actions: {
            sendSolution: ({ context }) => {
                const { connectorName, userId, chatId, appealId, solutionText } = context;
                console.log(`[Action sendSolution] userId=${userId}, appealId=${appealId}, solutionText=${solutionText?.substring(0, 50)}`);
                if (!appealId || !solutionText) return;

                (async () => {
                    try {
                        const solution = await createSolution({ solutionText });
                        await updateAppeal(appealId, { solutionId: solution.id });
                        console.log(`[Action sendSolution] Решение создано: solutionId=${solution.id}`);

                        const closedStatus = await getAppealStatusByName(
                            APPEAL_STATUS_NAMES.CLOSED,
                        );
                        if (closedStatus) {
                            await updateAppealStatus(appealId, closedStatus.id);
                            console.log(`[Action sendSolution] Статус обращения изменён на CLOSED`);
                        }

                        await messagingService.safeSendText(
                            connectorName,
                            userId,
                            chatId,
                            `🏁 Решение по обращению #${appealId.split('#')[1] ?? appealId} сохранено, обращение закрыто.`,
                        );
                        console.log(`[Action sendSolution] Успешно завершено для appealId=${appealId}`);
                    } catch (err) {
                        console.error('[support-chat:sendSolution] Ошибка:', err);
                        await messagingService.safeSendText(
                            connectorName,
                            userId,
                            chatId,
                            '❌ Не удалось сохранить решение. Попробуйте ещё раз.',
                        );
                    }
                })();
            },

            attach: ({ context }) => {
                const { connectorName, userId, chatId, appealId, isAttached } = context;
                console.log(`[Action attach] userId=${userId}, appealId=${appealId}, isAttached=${isAttached}`);
                if (!appealId) return;

                (async () => {
                    try {
                        const statusName = isAttached
                            ? APPEAL_STATUS_NAMES.IN_PROGRESS
                            : APPEAL_STATUS_NAMES.CREATED;
                        const status = await getAppealStatusByName(statusName);
                        if (status) {
                            await updateAppealStatus(appealId, status.id);
                            console.log(`[Action attach] Статус обращения обновлён на ${statusName}`);
                        }

                        await messagingService.safeSendText(
                            connectorName,
                            userId,
                            chatId,
                            isAttached
                                ? `✅ Вы прикреплены к обращению #${appealId.split('#')[1] ?? appealId}.`
                                : `🔓 Вы откреплены от обращения #${appealId.split('#')[1] ?? appealId}.`,
                        );
                        console.log(`[Action attach] Успешно завершено, isAttached=${isAttached}`);
                    } catch (err) {
                        console.error('[support-chat:attach] Ошибка:', err);
                    }
                })();
            },

            change_status: ({ context, event }) => {
                const { connectorName, userId, chatId, appealId } = context;
                console.log(`[Action change_status] userId=${userId}, appealId=${appealId}, event.statusName=${(event as any).statusName}`);
                if (!appealId) return;

                (async () => {
                    try {
                        const appeal = await getAppealById(appealId);
                        if (!appeal) return;

                        const currentStatus = await getAppealStatusById(appeal.appealStatusId);
                        const currentName = currentStatus?.name as AppealStatusName | undefined;
                        const requestedName =
                            event.type === 'CHANGE_STATUS_APPEAL'
                                ? event.statusName
                                : undefined;

                        const nextName: AppealStatusName | undefined =
                            requestedName ??
                            (currentName === APPEAL_STATUS_NAMES.IN_PROGRESS
                                ? APPEAL_STATUS_NAMES.WAITING_FOR_EXTERNAL
                                : currentName === APPEAL_STATUS_NAMES.WAITING_FOR_EXTERNAL
                                  ? APPEAL_STATUS_NAMES.IN_PROGRESS
                                  : APPEAL_STATUS_NAMES.IN_PROGRESS);

                        if (!nextName || nextName === currentName) return;

                        const nextStatus = await getAppealStatusByName(nextName);
                        if (!nextStatus) return;

                        await updateAppealStatus(appealId, nextStatus.id);
                        console.log(`[Action change_status] Статус изменён: ${currentName} → ${nextName}`);

                        await messagingService.safeSendText(
                            connectorName,
                            userId,
                            chatId,
                            `🔁 Статус обращения изменён: ${currentName ?? '?'} → ${nextName}.`,
                        );
                    } catch (err) {
                        console.error('[support-chat:change_status] Ошибка:', err);
                    }
                })();
            },

            showAppealList: ({ context }) => {
                const { connectorName, userId, chatId } = context;
                console.log(`[Action showAppealList] userId=${userId}, chatId=${chatId}`);
                (async () => {
                    try {
                        const [createdStatus, inProgressStatus] = await Promise.all([
                            getAppealStatusByName(APPEAL_STATUS_NAMES.CREATED),
                            getAppealStatusByName(APPEAL_STATUS_NAMES.IN_PROGRESS),
                        ]);

                        const [createdAppeals, inProgressAppeals] = await Promise.all([
                            createdStatus
                                ? getAppealsByStatus(createdStatus.id)
                                : Promise.resolve([]),
                            inProgressStatus
                                ? getAppealsByStatus(inProgressStatus.id)
                                : Promise.resolve([]),
                        ]);

                        const appeals = [...createdAppeals, ...inProgressAppeals].filter(
                            appeal => !appeal.deletedAt,
                        );

                        if (appeals.length === 0) {
                            await messagingService.safeSendText(
                                connectorName,
                                userId,
                                chatId,
                                '📭 Активных обращений нет.',
                            );
                            console.log(`[Action showAppealList] Активных обращений нет`);
                            return;
                        }

                        await messagingService.safeSendKeyboard(
                            connectorName,
                            userId,
                            chatId,
                            '📋 Список обращений:',
                            appeals.map(appeal => ({
                                text: `#${appeal.id.split('#')[1] ?? appeal.id} — ${appeal.textOfTheAppeal.slice(0, 30)}`,
                            })),
                        );
                        console.log(`[Action showAppealList] Отправлено ${appeals.length} обращений`);
                    } catch (err) {
                        console.error('[support-chat:showAppealList] Ошибка:', err);
                    }
                })();
            },

            showAppealDetails: ({ context }) => {
                const { connectorName, userId, chatId, appealId, isAttached } = context;
                console.log(`[Action showAppealDetails] userId=${userId}, appealId=${appealId}, isAttached=${isAttached}`);
                if (!appealId) return;

                (async () => {
                    try {
                        const appeal = await getAppealById(appealId);
                        if (!appeal) {
                            await messagingService.safeSendText(
                                connectorName,
                                userId,
                                chatId,
                                `❌ Обращение ${appealId} не найдено.`,
                            );
                            console.log(`[Action showAppealDetails] Обращение не найдено`);
                            return;
                        }

                        const status = await getAppealStatusById(appeal.appealStatusId);
                        const text =
                            `📄 Обращение #${appealId.split('#')[1] ?? appealId}\n` +
                            `Статус: ${status?.name ?? 'неизвестно'}\n` +
                            `Прикрепление: ${isAttached ? 'вы прикреплены' : 'вы не прикреплены'}\n\n` +
                            `Текст: ${appeal.textOfTheAppeal}`;

                        const buttons = [
                            ...(isAttached ? [{ text: 'Решить' }] : []),
                            {
                                text: isAttached ? 'Открепиться' : 'Прикрепиться',
                            },
                            { text: 'Сменить статус' },
                            { text: 'Назад' },
                        ];

                        await messagingService.safeSendKeyboard(
                            connectorName,
                            userId,
                            chatId,
                            text,
                            buttons,
                        );
                        console.log(`[Action showAppealDetails] Детали отправлены`);
                    } catch (err) {
                        console.error('[support-chat:showAppealDetails] Ошибка:', err);
                    }
                })();
            },

            showSelectAttachment: ({ context }) => {
                const { connectorName, userId, chatId, appealId, isAttached } = context;
                console.log(`[Action showSelectAttachment] appealId=${appealId}, isAttached=${isAttached}`);
                (async () => {
                    try {
                        const text = isAttached
                            ? `Открепиться от обращения #${appealId?.split('#')[1] ?? appealId}?`
                            : `Прикрепиться к обращению #${appealId?.split('#')[1] ?? appealId}?`;

                        await messagingService.safeSendKeyboard(
                            connectorName,
                            userId,
                            chatId,
                            text,
                            [{ text: 'Подтвердить' }, { text: 'Назад' }],
                        );
                        console.log(`[Action showSelectAttachment] Запрос подтверждения отправлен`);
                    } catch (err) {
                        console.error('[support-chat:showSelectAttachment] Ошибка:', err);
                    }
                })();
            },

            showEnterSolution: ({ context }) => {
                const { connectorName, userId, chatId, appealId } = context;
                console.log(`[Action showEnterSolution] appealId=${appealId}`);
                (async () => {
                    try {
                        await messagingService.safeSendKeyboard(
                            connectorName,
                            userId,
                            chatId,
                            `Введите решение для обращения #${appealId?.split('#')[1] ?? appealId}.`,
                            [{ text: 'Назад' }],
                        );
                        console.log(`[Action showEnterSolution] Приглашение к вводу решения отправлено`);
                    } catch (err) {
                        console.error('[support-chat:showEnterSolution] Ошибка:', err);
                    }
                })();
            },

            showConfirm: ({ context }) => {
                const { connectorName, userId, chatId, solutionText } = context;
                console.log(`[Action showConfirm] solutionText=${solutionText?.substring(0, 50)}`);
                (async () => {
                    try {
                        await messagingService.safeSendKeyboard(
                            connectorName,
                            userId,
                            chatId,
                            `Подтвердите отправку решения:\n\n${solutionText ?? '(пусто)'}`,
                            [{ text: 'Отправить' }, { text: 'Назад' }],
                        );
                        console.log(`[Action showConfirm] Запрос подтверждения решения отправлен`);
                    } catch (err) {
                        console.error('[support-chat:showConfirm] Ошибка:', err);
                    }
                })();
            },

            showHelp: ({ context }) => {
                const { connectorName, userId, chatId, appealId, isAttached } = context;
                console.log(`[Action showHelp] userId=${userId}, appealId=${appealId}, isAttached=${isAttached}`);
                (async () => {
                    try {
                        await messagingService.safeSendText(
                            connectorName,
                            userId,
                            chatId,
                            `Подсказки:\n• Список обращений — открыть карточку.\n• Прикрепиться/Открепиться — сменить статус участия.\n• Решить — ввести и отправить решение.\n• Сменить статус — переключить статус обращения.\n\nТекущее обращение: ${appealId ?? 'не выбрано'}\nПрикрепление: ${isAttached ? 'да' : 'нет'}`,
                        );
                        console.log(`[Action showHelp] Справка отправлена`);
                    } catch (err) {
                        console.error('[support-chat:showHelp] Ошибка:', err);
                    }
                })();
            },

            toggleAttachStatus: assign({
                isAttached: ({ context }) => {
                    const newValue = !context.isAttached;
                    console.log(`[Action toggleAttachStatus] isAttached: ${context.isAttached} → ${newValue}`);
                    return newValue;
                },
            }),
        },
    },
);
/**
 * Тесты переходов состояний бота
 *
 * Два уровня тестирования:
 * 1. Unit-тесты машин состояний (XState actor напрямую)
 * 2. Интеграционные тесты через HTTP (controller + router + supertest)
 */

import supertest from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

// ── Моки внешних зависимостей (поднимаем до import модулей) ──────────────────

vi.mock('../services/state-service.js', () => ({
    default: {
        getUserSnapshotWithMeta: vi.fn().mockResolvedValue(),
        saveUserSnapshot: vi.fn().mockResolvedValue(true),
    },
}));

vi.mock('../db/tables/support-staff.js', () => ({
    isSupportStaff: vi.fn().mockResolvedValue(false),
}));

vi.mock('../services/appeal-service.js', () => ({
    listRequestsForUser: vi.fn().mockResolvedValue('(список пуст)'),
}));

vi.mock('../services/dynamo-service.js', () => ({
    createAppeal: vi.fn().mockResolvedValue('appeal-test-id'),
}));

// ── Импорты после моков ──────────────────────────────────────────────────────

import { buildApp } from '../app.js';
import { appealRootMachine } from '../machines/main-states.js';
import { appealCreateMachine } from '../machines/master-create-appeal.js';
import { appealJoinMachine } from '../machines/master-join-appeal.js';
import stateService from '../services/state-service.js';

// Хелперы

const TEST_USER_ID = 'test-user-001';

/** Получить строковое имя текущего состояния из actor */
function getStateName(actor: ReturnType<typeof createActor>): string {
    const snap = actor.getSnapshot();
    const val = snap.value;
    return typeof val === 'string' ? val : JSON.stringify(val);
}

/** Создать и запустить корневую машину для нового пользователя */
function createRootActor(userId = TEST_USER_ID) {
    const actor = createActor(appealRootMachine, { input: { userId } });
    actor.start();
    return actor;
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. UNIT-ТЕСТЫ МАШИН СОСТОЯНИЙ
// ═════════════════════════════════════════════════════════════════════════════

describe('Корневая машина состояний (appealRootMachine)', () => {
    describe('Начальное состояние', () => {
        it('начинает в состоянии welcome', () => {
            const actor = createRootActor();
            expect(getStateName(actor)).toBe('welcome');
            actor.stop();
        });

        it('сохраняет userId в контексте', () => {
            const actor = createRootActor('user-42');
            expect(actor.getSnapshot().context.userId).toBe('user-42');
            actor.stop();
        });
    });

    describe('welcome → переходы', () => {
        it('OPEN_LIST: welcome → listAppeals', () => {
            const actor = createRootActor();
            actor.send({ type: 'OPEN_LIST' });
            expect(getStateName(actor)).toBe('listAppeals');
            actor.stop();
        });

        it('OPEN_CREATE: welcome → createAppeal', () => {
            const actor = createRootActor();
            actor.send({ type: 'OPEN_CREATE' });
            expect(getStateName(actor)).toBe('createAppeal');
            actor.stop();
        });

        it('HELP: остаётся в welcome', () => {
            const actor = createRootActor();
            actor.send({ type: 'HELP' });
            expect(getStateName(actor)).toBe('welcome');
            actor.stop();
        });

        it('неизвестное событие: остаётся в welcome', () => {
            const actor = createRootActor();
            actor.send({ type: 'BACK' } as any);
            expect(getStateName(actor)).toBe('welcome');
            actor.stop();
        });
    });

    describe('listAppeals → переходы', () => {
        it('BACK: listAppeals → welcome', () => {
            const actor = createRootActor();
            actor.send({ type: 'OPEN_LIST' });
            actor.send({ type: 'BACK' });
            expect(getStateName(actor)).toBe('welcome');
            actor.stop();
        });

        it('OPEN_CREATE: listAppeals → createAppeal', () => {
            const actor = createRootActor();
            actor.send({ type: 'OPEN_LIST' });
            actor.send({ type: 'OPEN_CREATE' });
            expect(getStateName(actor)).toBe('createAppeal');
            actor.stop();
        });

        it('SELECT_APPEAL: listAppeals → specificAppeal + сохраняет appealId', () => {
            const actor = createRootActor();
            actor.send({ type: 'OPEN_LIST' });
            actor.send({ type: 'SELECT_APPEAL', appealId: 'appeal-123' });
            expect(getStateName(actor)).toBe('specificAppeal');
            expect(actor.getSnapshot().context.appealId).toBe('appeal-123');
            actor.stop();
        });

        it('HELP: остаётся в listAppeals', () => {
            const actor = createRootActor();
            actor.send({ type: 'OPEN_LIST' });
            actor.send({ type: 'HELP' });
            expect(getStateName(actor)).toBe('listAppeals');
            actor.stop();
        });
    });

    describe('specificAppeal → переходы', () => {
        function toSpecificAppeal() {
            const actor = createRootActor();
            actor.send({ type: 'OPEN_LIST' });
            actor.send({ type: 'SELECT_APPEAL', appealId: 'appeal-456' });
            return actor;
        }

        it('BACK: specificAppeal → listAppeals', () => {
            const actor = toSpecificAppeal();
            actor.send({ type: 'BACK' });
            expect(getStateName(actor)).toBe('listAppeals');
            actor.stop();
        });

        it('JOIN_APPEAL: specificAppeal → joinMaster', () => {
            const actor = toSpecificAppeal();
            actor.send({ type: 'JOIN_APPEAL' });
            expect(getStateName(actor)).toBe('joinMaster');
            actor.stop();
        });

        it('HELP: остаётся в specificAppeal', () => {
            const actor = toSpecificAppeal();
            actor.send({ type: 'HELP' });
            expect(getStateName(actor)).toBe('specificAppeal');
            actor.stop();
        });
    });

    describe('Цепочки переходов (сценарии)', () => {
        it('Полный путь: welcome → listAppeals → specificAppeal → back → welcome', () => {
            const actor = createRootActor();
            expect(getStateName(actor)).toBe('welcome');
            actor.send({ type: 'OPEN_LIST' });
            expect(getStateName(actor)).toBe('listAppeals');
            actor.send({ type: 'SELECT_APPEAL', appealId: 'a1' });
            expect(getStateName(actor)).toBe('specificAppeal');
            actor.send({ type: 'BACK' });
            expect(getStateName(actor)).toBe('listAppeals');
            actor.send({ type: 'BACK' });
            expect(getStateName(actor)).toBe('welcome');
            actor.stop();
        });

        it('OPEN_CREATE из listAppeals обходит welcome', () => {
            const actor = createRootActor();
            actor.send({ type: 'OPEN_LIST' });
            actor.send({ type: 'OPEN_CREATE' });
            expect(getStateName(actor)).toBe('createAppeal');
            actor.stop();
        });
    });
});

describe('Дочерняя машина создания обращения (appealCreateMachine)', () => {
    function createChildActor() {
        const actor = createActor(appealCreateMachine);
        actor.start();
        return actor;
    }

    it('начинает в состоянии manageAppeal', () => {
        const actor = createChildActor();
        expect(getStateName(actor)).toBe('manageAppeal');
        actor.stop();
    });

    it('ADD_DESCRIPTION: manageAppeal → waitingDescription', () => {
        const actor = createChildActor();
        actor.send({ type: 'ADD_DESCRIPTION' });
        expect(getStateName(actor)).toBe('waitingDescription');
        actor.stop();
    });

    it('SELECT_CATEGORY: manageAppeal → chooseCategory', () => {
        const actor = createChildActor();
        actor.send({ type: 'SELECT_CATEGORY' });
        expect(getStateName(actor)).toBe('chooseCategory');
        actor.stop();
    });

    it('CHOOSE_SOFTWARE: manageAppeal → waitingSoftware', () => {
        const actor = createChildActor();
        actor.send({ type: 'CHOOSE_SOFTWARE' });
        expect(getStateName(actor)).toBe('waitingSoftware');
        actor.stop();
    });

    it('SET_CRITICALITY: manageAppeal → waitingCriticality', () => {
        const actor = createChildActor();
        actor.send({ type: 'SET_CRITICALITY' });
        expect(getStateName(actor)).toBe('waitingCriticality');
        actor.stop();
    });

    it('ATTACH_FILE: manageAppeal → waitingAttachments', () => {
        const actor = createChildActor();
        actor.send({ type: 'ATTACH_FILE', fileId: 'file-1' });
        expect(getStateName(actor)).toBe('waitingAttachments');
        actor.stop();
    });

    it('CONFIRM_CREATION: manageAppeal → fixationAppeal', () => {
        const actor = createChildActor();
        actor.send({ type: 'CONFIRM_CREATION' });
        expect(getStateName(actor)).toBe('fixationAppeal');
        actor.stop();
    });

    it('CANCEL_CREATION через родительскую машину: createAppeal → welcome', () => {
        // Дочерняя машина использует sendParent при CANCEL_CREATION,
        // поэтому проверяем через корневую машину
        const actor = createRootActor();
        actor.send({ type: 'OPEN_CREATE' });
        expect(getStateName(actor)).toBe('createAppeal');
        actor.send({ type: 'CANCEL_CREATION' });
        // Корневая машина должна получить CREATION_RESULT cancelled → вернуться в welcome
        expect(getStateName(actor)).toBe('welcome');
        actor.stop();
    });

    it('waitingDescription: TEXT_INPUT → manageAppeal', () => {
        const actor = createChildActor();
        actor.send({ type: 'ADD_DESCRIPTION' });
        actor.send({ type: 'TEXT_INPUT', text: 'Тестовое описание' });
        expect(getStateName(actor)).toBe('manageAppeal');
        expect(actor.getSnapshot().context.description).toBe(
            'Тестовое описание',
        );
        actor.stop();
    });

    it('waitingDescription: BACK → manageAppeal', () => {
        const actor = createChildActor();
        actor.send({ type: 'ADD_DESCRIPTION' });
        actor.send({ type: 'BACK' });
        expect(getStateName(actor)).toBe('manageAppeal');
        actor.stop();
    });

    it('chooseCategory: TEXT_INPUT сохраняет категорию и возвращает в manageAppeal', () => {
        const actor = createChildActor();
        actor.send({ type: 'SELECT_CATEGORY' });
        actor.send({ type: 'TEXT_INPUT', text: 'Категория А' });
        expect(getStateName(actor)).toBe('manageAppeal');
        expect(actor.getSnapshot().context.category).toBe('Категория А');
        actor.stop();
    });

    it('waitingSoftware: TEXT_INPUT сохраняет ПО и возвращает в manageAppeal', () => {
        const actor = createChildActor();
        actor.send({ type: 'CHOOSE_SOFTWARE' });
        actor.send({ type: 'TEXT_INPUT', text: '1С:Предприятие' });
        expect(getStateName(actor)).toBe('manageAppeal');
        expect(actor.getSnapshot().context.software).toBe('1С:Предприятие');
        actor.stop();
    });

    it('waitingCriticality: TEXT_INPUT сохраняет критичность', () => {
        const actor = createChildActor();
        actor.send({ type: 'SET_CRITICALITY' });
        actor.send({ type: 'TEXT_INPUT', text: 'Высокая' });
        expect(getStateName(actor)).toBe('manageAppeal');
        expect(actor.getSnapshot().context.criticality).toBe('Высокая');
        actor.stop();
    });

    it('waitingAttachments: STOP_ATTACHING → manageAppeal', () => {
        const actor = createChildActor();
        actor.send({ type: 'ATTACH_FILE', fileId: 'f1' });
        actor.send({ type: 'STOP_ATTACHING' });
        expect(getStateName(actor)).toBe('manageAppeal');
        actor.stop();
    });

    it('fixationAppeal: CANCEL_FIXATION → manageAppeal', () => {
        const actor = createChildActor();
        actor.send({ type: 'CONFIRM_CREATION' });
        actor.send({ type: 'CANCEL_FIXATION' });
        expect(getStateName(actor)).toBe('manageAppeal');
        actor.stop();
    });

    it('ATTACH_FILE с fileId добавляет файл в контекст', () => {
        const actor = createChildActor();
        actor.send({ type: 'ATTACH_FILE', fileId: 'file-abc' });
        expect(actor.getSnapshot().context.attachments).toContain('file-abc');
        actor.stop();
    });
});

describe('Дочерняя машина присоединения к обращению (appealJoinMachine)', () => {
    function createJoinActor() {
        const actor = createActor(appealJoinMachine);
        actor.start();
        return actor;
    }

    it('начинает в состоянии confirmJoin', () => {
        const actor = createJoinActor();
        expect(getStateName(actor)).toBe('confirmJoin');
        actor.stop();
    });

    it('CONFIRM: confirmJoin → registerJoin (финал)', () => {
        const actor = createJoinActor();
        actor.send({ type: 'CONFIRM' });
        expect(getStateName(actor)).toBe('registerJoin');
        actor.stop();
    });

    it('CANCEL_JOIN: confirmJoin → cancelJoinProcess (финал)', () => {
        const actor = createJoinActor();
        actor.send({ type: 'CANCEL_JOIN' });
        expect(getStateName(actor)).toBe('cancelJoinProcess');
        actor.stop();
    });

    it('HELP: остаётся в confirmJoin', () => {
        const actor = createJoinActor();
        actor.send({ type: 'HELP' });
        expect(getStateName(actor)).toBe('confirmJoin');
        actor.stop();
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. ИНТЕГРАЦИОННЫЕ ТЕСТЫ (controller + router через HTTP)
//
// Примечание: каждый HTTP-вызов через controller ждёт смены состояния
// до 5 секунд (внутренний таймаут контроллера). Интеграционные тесты
// сосредоточены на ключевых сценариях, а не на переборе всех действий.
// ═════════════════════════════════════════════════════════════════════════════

describe('Интеграционные тесты: HTTP → controller → машина состояний', () => {
    const app = buildApp();
    const request = supertest(app);

    const mockStateService = stateService as {
        getUserSnapshotWithMeta: ReturnType<typeof vi.fn>;
        saveUserSnapshot: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockStateService.getUserSnapshotWithMeta.mockResolvedValue();
        mockStateService.saveUserSnapshot.mockResolvedValue(true);
    });

    // /api/v1/health-check (синхронный — не ждёт машину)

    it('GET /api/v1/health-check → 200 OK', async () => {
        const res = await request.get('/api/v1/health-check');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'OK' });
    });

    // ── POST /api/v1/command ──────────────────────────────────────────────

    it('POST /command START: контроллер создаёт машину, сохраняет снимок, возвращает 200', async () => {
        const res = await request.post('/api/v1/command').send({
            user_id: TEST_USER_ID,
            button: '',
            place: { chat_id: 'chat-1' },
            date_time: new Date().toISOString(),
            name: 'START',
        });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
        expect(mockStateService.saveUserSnapshot).toHaveBeenCalledWith(
            TEST_USER_ID,
            expect.anything(),
            'appealRoot',
        );
    }, 10_000);

    // ── POST /api/v1/message/action ───────────────────────────────────────

    it('POST /action OPEN_LIST: welcome → listAppeals, снимок сохраняется', async () => {
        const res = await request.post('/api/v1/message/action').send({
            user_id: TEST_USER_ID,
            place: { chat_id: 'chat-1' },
            date_time: new Date().toISOString(),
            action: 'OPEN_LIST',
        });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true });
        expect(mockStateService.saveUserSnapshot).toHaveBeenCalled();
    }, 10_000);

    it('POST /action OPEN_CREATE: welcome → createAppeal, снимок сохраняется', async () => {
        const res = await request.post('/api/v1/message/action').send({
            user_id: TEST_USER_ID,
            place: { chat_id: 'chat-1' },
            date_time: new Date().toISOString(),
            action: 'OPEN_CREATE',
        });

        expect(res.status).toBe(200);
        expect(mockStateService.saveUserSnapshot).toHaveBeenCalled();
    }, 10_000);

    // ── Восстановление из снимка и переход ────────────────────────────────

    it('Восстановление из снимка listAppeals + BACK → welcome', async () => {
        // 1. Получаем снимок машины в состоянии listAppeals
        const actor = createRootActor(TEST_USER_ID);
        actor.send({ type: 'OPEN_LIST' });
        const snapshot = actor.getPersistedSnapshot
            ? actor.getPersistedSnapshot()
            : actor.getSnapshot();
        actor.stop();

        // 2. Имитируем наличие сохранённого снимка в БД
        mockStateService.getUserSnapshotWithMeta.mockResolvedValue({
            snapshot,
            machineType: 'appealRoot',
            currentState: 'listAppeals',
        });

        // 3. Отправляем BACK — должен вернуть в welcome
        const res = await request.post('/api/v1/message/action').send({
            user_id: TEST_USER_ID,
            place: { chat_id: 'chat-1' },
            date_time: new Date().toISOString(),
            action: 'BACK',
        });

        expect(res.status).toBe(200);

        // 4. Снимок должен быть сохранён с конечным состоянием welcome
        const [savedUserId, savedActor] =
            mockStateService.saveUserSnapshot.mock.calls[0] ?? [];
        expect(savedUserId).toBe(TEST_USER_ID);

        if (savedActor) {
            const savedSnap = savedActor.getSnapshot();
            const finalState =
                typeof savedSnap.value === 'string'
                    ? savedSnap.value
                    : JSON.stringify(savedSnap.value);
            expect(finalState).toBe('welcome');
        }
    }, 10_000);

    it('Восстановление из снимка specificAppeal + JOIN_APPEAL → joinMaster', async () => {
        const actor = createRootActor(TEST_USER_ID);
        actor.send({ type: 'OPEN_LIST' });
        actor.send({ type: 'SELECT_APPEAL', appealId: 'ap-99' });
        const snapshot = actor.getPersistedSnapshot
            ? actor.getPersistedSnapshot()
            : actor.getSnapshot();
        actor.stop();

        mockStateService.getUserSnapshotWithMeta.mockResolvedValue({
            snapshot,
            machineType: 'appealRoot',
            currentState: 'specificAppeal',
        });

        const res = await request.post('/api/v1/message/action').send({
            user_id: TEST_USER_ID,
            place: { chat_id: 'chat-1' },
            date_time: new Date().toISOString(),
            action: 'JOIN_APPEAL',
        });

        expect(res.status).toBe(200);
        expect(mockStateService.saveUserSnapshot).toHaveBeenCalled();
    }, 10_000);
});

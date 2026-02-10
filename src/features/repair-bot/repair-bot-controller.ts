import { createActor } from 'xstate';

import { repairBotMachine } from '../../machines/repair-bot-machine.js';
import stateService from '../../services/state-service.js';

interface SessionResult {
    userId: string;
    currentState: string;
    message: string;
}

interface StateResult extends SessionResult {
    history: Array<{ state: string; timestamp: string }>;
    context: any;
    message: string; // Добавляем это
}

class RepairBotController {
    async startSession(userId: string): Promise<SessionResult> {
        const actor = createActor(repairBotMachine);
        actor.start();

        const state = {
            actor,
            context: {},
            history: [],
        };

        stateService.setUserState(userId, state);

        actor.subscribe(snapshot => {
            const userState = stateService.getUserState(userId);
            if (userState) {
                userState.history.push({
                    state: snapshot.value as string,
                    timestamp: new Date().toISOString(),
                });
                stateService.setUserState(userId, userState);
            }
        });

        actor.send({ type: 'START' });

        const currentSnapshot = actor.getSnapshot();

        return {
            userId,
            currentState: currentSnapshot.value as string,
            message: 'Сессия начата!',
        };
    }

    async sendEvent(
        userId: string,
        event: { type: string; problem?: string; details?: string },
    ): Promise<SessionResult> {
        const userState = stateService.getUserState(userId);

        if (!userState || !userState.actor) {
            throw new Error('Сессия не найдена. Начните новую сессию.');
        }

        userState.actor.send(event);

        const currentSnapshot = userState.actor.getSnapshot();

        return {
            userId,
            currentState: currentSnapshot.value as string,
            message: `Событие ${event.type} обработано`,
        };
    }

    async getState(userId: string): Promise<StateResult> {
        const userState = stateService.getUserState(userId);

        if (!userState || !userState.actor) {
            throw new Error('Сессия не найдена');
        }

        const snapshot = userState.actor.getSnapshot();

        return {
            userId,
            currentState: snapshot.value as string,
            history: userState.history,
            context: snapshot.context,
            message: 'Хранилище успешно получено',
        };
    }

    async endSession(userId: string): Promise<SessionResult> {
        const userState = stateService.getUserState(userId);

        if (userState && userState.actor) {
            userState.actor.stop();
        }

        stateService.deleteUserState(userId);

        return {
            userId,
            currentState: 'ended',
            message: 'Сессия завершена',
        };
    }
}

export default new RepairBotController();

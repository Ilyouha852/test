import { createActor } from 'xstate';
import { repairBotMachine } from './machines/repairBotMachine.js';
import stateService from '../../services/stateService.js';

interface SessionResult {
  userId: string;
  currentState: string;
  message: string;
  question?: string;
  result?: string;
}

class RepairBotController {
  async startSession(userId: string): Promise<SessionResult> {
    const actor = createActor(repairBotMachine);
    actor.start();
    
    const initialState = {
      actor,
      context: {},
      history: [{
        state: actor.getSnapshot().value as string,
        timestamp: new Date().toISOString()
      }]
    };
    
    stateService.setUserState(userId, initialState);
    
    actor.subscribe((snapshot) => {
      const userState = stateService.getUserState(userId);
      if (userState) {
        userState.history.push({
          state: snapshot.value as string,
          timestamp: new Date().toISOString()
        });
        stateService.setUserState(userId, userState);
      }
    });

    const currentSnapshot = actor.getSnapshot();
    const meta = this.getMeta(currentSnapshot);
    
    return {
      userId,
      currentState: currentSnapshot.value as string,
      question: meta.question,
      message: 'Сессия диагностики начата!'
    };
  }

  async sendEvent(userId: string, event: { type: string }): Promise<SessionResult> {
    const userState = stateService.getUserState(userId);
    
    if (!userState || !userState.actor) {
      throw new Error('Сессия не найдена. Начните новую сессию.');
    }

    userState.actor.send(event);
    
    const currentSnapshot = userState.actor.getSnapshot();
    const meta = this.getMeta(currentSnapshot);
    
    // Если конечное состояние - возвращаем результат
    if (currentSnapshot.status === 'done') {
      return {
        userId,
        currentState: currentSnapshot.value as string,
        result: meta.result,
        message: 'Диагностика завершена!'
      };
    }
    
    // Если промежуточное состояние - возвращаем вопрос
    return {
      userId,
      currentState: currentSnapshot.value as string,
      question: meta.question,
      message: `Ответ принят`
    };
  }

  async getState(userId: string): Promise<SessionResult & { history: any[] }> {
    const userState = stateService.getUserState(userId);
    
    if (!userState || !userState.actor) {
      throw new Error('Сессия не найдена');
    }

    const snapshot = userState.actor.getSnapshot();
    const meta = this.getMeta(snapshot);

    return {
      userId,
      currentState: snapshot.value as string,
      question: meta.question,
      result: meta.result,
      history: userState.history,
      message: `Текущее состояние: ${snapshot.value}`
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
      message: 'Сессия завершена'
    };
  }

  // Вспомогательный метод для извлечения meta данных
  private getMeta(snapshot: any): { question?: string; result?: string } {
    const meta = snapshot.getMeta();
    const stateMeta = meta[Object.keys(meta)[0]];
    return {
      question: stateMeta?.question,
      result: stateMeta?.result
    };
  }
}

export default new RepairBotController();
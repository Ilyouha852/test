import NodeCache from 'node-cache';

interface UserState {
  actor: any;
  context: any;
  history: Array<{
    state: string;
    timestamp: string;
  }>;
}

class StateService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 3600 });
  }

  getUserState(userId: string): UserState | undefined {
    return this.cache.get(userId);
  }

  setUserState(userId: string, state: UserState): boolean {
    return this.cache.set(userId, state);
  }

  deleteUserState(userId: string): number {
    return this.cache.del(userId);
  }

  getAllUsers(): string[] {
    return this.cache.keys();
  }
}

export default new StateService();
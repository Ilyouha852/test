import type { UnifiedMessage } from '../types.js';

export interface Connector {
  name: string;

  /**
   * Парсит "сырую" полезную нагрузку от мессенджера в UnifiedMessage.
   * Возвращает null, если нагрузка не является валидным сообщением или должна быть проигнорирована.
   */
  parse(payload: any): Promise<UnifiedMessage | null>;

  /**
   * Отправляет сообщение обратно пользователю через этот коннектор.
   */
  sendMessage(chatId: string, content: string): Promise<void>;
}

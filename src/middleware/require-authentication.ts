import type { Request, Response, NextFunction } from 'express';
import { getJwtTokenFromCookie } from '../features/user-authentication/user-authentication-helpers.js';

/**
 * Middleware для проверки аутентификации пользователя.
 * Выбрасывает ошибку, если токен отсутствует или невалиден.
 */
export function requireAuthentication(request: Request, response: Response, next: NextFunction) {
  try {
    const tokenPayload = getJwtTokenFromCookie(request);
    (request as any).user = tokenPayload; // Добавляем пользователя в request
    next(); // ✅ ВАЖНО: вызываем next() для продолжения
  } catch (error) {
    // ❌ Ошибка аутентификации - не вызываем next(), отправляем ответ
    response.status(401).json({ message: 'Unauthorized' });
  }
}
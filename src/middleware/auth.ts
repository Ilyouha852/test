import type { Request, Response, NextFunction } from 'express';
import { verifyJwtToken } from '../features/user-authentication/user-authentication-helpers.js';

export function authenticateToken(request: Request, response: Response, next: NextFunction) {
  const token = request.cookies.jwt;

  if (!token) {
    return response.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = verifyJwtToken(token);
    (request as any).user = decoded; // Добавляем пользователя в request
    next();
  } catch (error) {
    return response.status(403).json({ message: 'Invalid or expired token' });
  }
}
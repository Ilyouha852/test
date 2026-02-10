import type { NextFunction, Request, Response } from 'express';

import { verifyJwtToken } from '../features/user-authentication/user-authentication-helpers.js';

export function authenticateToken(
    request: Request,
    response: Response,
    next: NextFunction,
) {
    const token = request.cookies.jwt;

    if (!token) {
        return response
            .status(401)
            .json({ message: 'Требуется аутентификация' });
    }

    try {
        const decoded = verifyJwtToken(token);
        (request as any).user = decoded; // Добавляем пользователя в request
        next();
    } catch {
        return response
            .status(403)
            .json({ message: 'Неверный или истекший токен' });
    }
}

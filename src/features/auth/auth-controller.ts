import type { Request, Response } from 'express';

export async function setCookie(request: Request, response: Response) {
    const { name, value } = request.body;

    // Устанавливаем куку
    response.cookie(name, value, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 день
    });

    response.json({ message: 'Куки успешно установлены' });
}

export async function getCookies(request: Request, response: Response) {
    // Читаем все куки из запроса
    response.json({ cookies: request.cookies });
}

export async function clearCookie(request: Request, response: Response) {
    const { name } = request.body;

    // Очищаем куку
    response.clearCookie(name);

    response.json({ message: 'Куки успешно очищены' });
}

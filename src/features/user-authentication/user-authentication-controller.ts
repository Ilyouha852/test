import type { Request, Response } from 'express';

import { validateBody } from '../../middleware/validate.js';
import {
    retrieveUserProfileFromDatabaseByEmail,
    saveUserProfileToDatabase,
} from '../user-profile/user-profile-model.js';
import {
    clearJwtCookie,
    generateJwtToken,
    getIsPasswordValid,
    hashPassword,
    setJwtCookie,
} from './user-authentication-helpers.js';
import { loginSchema, registerSchema } from './user-authentication-schemas.js';

export async function login(request: Request, response: Response) {
    try {
        const body = await validateBody(loginSchema, request, response);

        const user = await retrieveUserProfileFromDatabaseByEmail(body.email);

        if (user) {
            const isPasswordValid = await getIsPasswordValid(
                body.password,
                user.hashedPassword,
            );

            if (isPasswordValid) {
                const token = generateJwtToken(user);
                setJwtCookie(response, token);
                response.json({ message: 'Успешный вход' });
            } else {
                response
                    .status(401)
                    .json({ message: 'Неверные учетные данные' });
            }
        } else {
            response.status(401).json({ message: 'Неверные учетные данные' });
        }
    } catch {
        // Ошибки валидации уже обработаны в validateBody
    }
}

export async function register(request: Request, response: Response) {
    try {
        const body = await validateBody(registerSchema, request, response);

        // Проверяем нет ли уже пользователя с таким email
        const existingUser = await retrieveUserProfileFromDatabaseByEmail(
            body.email,
        );
        if (existingUser) {
            return response
                .status(409)
                .json({ message: 'Пользователь уже существует' });
        }

        // Создаем нового пользователя
        const hashedPassword = await hashPassword(body.password);
        const userProfile = await saveUserProfileToDatabase({
            email: body.email,
            name: body.name,
            hashedPassword: hashedPassword,
        });

        const token = generateJwtToken(userProfile);
        setJwtCookie(response, token);
        response.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: {
                id: userProfile.id,
                email: userProfile.email,
                name: userProfile.name,
            },
        });
    } catch {
        // Ошибки валидации уже обработаны в validateBody
    }
}

export async function logout(request: Request, response: Response) {
    clearJwtCookie(response);
    response.json({ message: 'Успешный выход' });
}

export async function getMe(request: Request, response: Response) {
    const user = (request as any).user;
    response.json({
        message: 'Профиль пользователя',
        user: {
            id: user.id,
            email: user.email,
        },
    });
}

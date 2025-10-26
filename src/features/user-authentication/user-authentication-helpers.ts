import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import type { Request } from 'express';
import type { UserProfile } from '../user-profile/user-profile-model.js';

dotenv.config();

export const JWT_COOKIE_NAME = 'jwt';

/**
 * Хэширует пароль.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Сравнивает пароль с хэшированным паролем.
 */
export async function getIsPasswordValid(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Генерирует токен JWT.
 */
export function generateJwtToken(userProfile: UserProfile): string {
  const tokenPayload = {
    id: userProfile.id,
    email: userProfile.email,
  };
  return jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
    expiresIn: 60 * 60 * 24 * 365, // 1 год
  });
}

/**
 * Устанавливает куки JWT.
 */
export function setJwtCookie(response: Response, token: string): void {
  response.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 год
  });
}

/**
 * Валидирует JWT токен
 */
export function verifyJwtToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Модифицирует ответ, указываю браузеру удалить куки JWT.
 */
export function clearJwtCookie(response: Response) {
  response.clearCookie(JWT_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

/**
 * Проверяет валидность токена.
 */
function isTokenValid(token: jwt.JwtPayload | string): token is { id: string; email: string } {
  return (
    typeof token === 'object' &&
    token !== null &&
    'id' in token &&
    'email' in token
  );
}

/**
 * Извлекает токен JWT из куки.
 */
export function getJwtTokenFromCookie(request: Request): { id: string; email: string } {
  const token = request.cookies[JWT_COOKIE_NAME];

  if (!token) {
    throw new Error('No token found');
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);

    if (isTokenValid(decodedToken)) {
      return decodedToken;
    } else {
      throw new Error('Invalid token payload');
    }
  } catch (error) {
    throw new Error('Invalid or expired token'); 
  }
}
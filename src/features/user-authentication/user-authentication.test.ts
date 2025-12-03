import { createId } from '@paralleldrive/cuid2';
import request from 'supertest';
import { describe, expect, onTestFinished, test } from 'vitest';

import { buildApp } from '../../app.js';
import { createPopulatedUserProfile } from '../user-profile/user-profile-factories.js';
import {
  deleteUserProfileFromDatabaseById,
  retrieveUserProfileFromDatabaseByEmail,
  saveUserProfileToDatabase,
} from '../user-profile/user-profile-model.js';
import { hashPassword } from './user-authentication-helpers.js';

async function setup({ password = 'password' }: { password?: string } = {}) {
  const app = buildApp();

  const userProfile = await saveUserProfileToDatabase(
    createPopulatedUserProfile({
      hashedPassword: await hashPassword(password),
    }),
  );

  onTestFinished(async () => {
    await deleteUserProfileFromDatabaseById(userProfile.id);
  });

  return { app, userProfile };
}

describe('/api/v1/login', () => {
  test('дано: валидные данные существующего пользователя, ожидается: возврат статуса 200 и установка JWT куки', async () => {
    const password = createId();
    const { app, userProfile } = await setup({ password });

    const actual = await request(app)
      .post('/api/v1/login')
      .send({ email: userProfile.email, password })
      .expect(200);

    expect(actual.body).toEqual({ message: 'Успешный вход' });
    const cookies = actual.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(cookies.some(cookie => cookie.includes('jwt='))).toEqual(true);
  });

  test('дано: валидные данные несуществующего пользователя, ожидается: возврат статуса 401', async () => {
    const { app } = await setup();

    const { body: actual } = await request(app)
      .post('/api/v1/login')
      .send({ email: 'non-existing@test.com', password: 'password' })
      .expect(401);
    const expected = { message: 'Неверные учетные данные' };

    expect(actual).toEqual(expected);
  });

  test('дано: валидный email, но неверный пароль существующего пользователя, ожидается: возврат статуса 401', async () => {
    const { app, userProfile } = await setup();

    const actual = await request(app)
      .post('/api/v1/login')
      .send({ email: userProfile.email, password: 'invalid password' })
      .expect(401);

    expect(actual.body).toEqual({ message: 'Неверные учетные данные' });
  });

  test('дано: невалидные данные, ожидается: возврат статуса 400', async () => {
    const { app } = await setup();

    const { body: actual } = await request(app)
      .post('/api/v1/login')
      .send({})
      .expect(400);

    expect(actual.message).toEqual('Неверный запрос');
    expect(actual.errors).toBeDefined();
  });
});

describe('/api/v1/register', () => {
  test('дано: валидные данные для регистрации, ожидается: создание пользователя и возврат статуса 201', async () => {
    const app = buildApp();
    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';

    const { body: actual } = await request(app)
      .post('/api/v1/register')
      .send({ email, password, name })
      .expect(201);

    expect(actual).toEqual({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: expect.any(String),
        email: email,
        name: name,
      },
    });

    // Проверяем запись пользователя в БД
    const createdUser = await retrieveUserProfileFromDatabaseByEmail(email);
    expect(createdUser).toBeDefined();
    expect(createdUser?.email).toEqual(email);

    // Очистка
    if (createdUser) {
      await deleteUserProfileFromDatabaseById(createdUser.id);
    }
  });

  test('дано: email, который уже существует, ожидается: возврат статуса 409', async () => {
    const password = createId();
    const { app, userProfile } = await setup({ password });

    const { body: actual } = await request(app)
      .post('/api/v1/register')
      .send({
        email: userProfile.email,
        password: 'newpassword123',
        name: 'New User',
      })
      .expect(409);

    expect(actual).toEqual({ message: 'Пользователь уже существует' });
  });

  test('дано: невалидные данные для регистрации, ожидается: возврат статуса 400', async () => {
    const app = buildApp();

    const { body: actual } = await request(app)
      .post('/api/v1/register')
      .send({})
      .expect(400);

    expect(actual.message).toEqual('Неверный запрос');
    expect(actual.errors).toBeDefined();
  });
});

describe('/api/v1/logout', () => {
  test('дано: любой запрос POST, ожидается: очистка JWT куки и возврат статуса 200', async () => {
    const { app } = await setup();

    const response = await request(app).post('/api/v1/logout').expect(200);

    expect(response.body).toEqual({ message: 'Успешный выход' });

    // Проверяем очистку куки
    const cookies = response.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    expect(cookies.some(cookie => cookie.includes('jwt=;'))).toEqual(true);
  });
});

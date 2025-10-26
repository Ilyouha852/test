import { createId } from '@paralleldrive/cuid2';
import request from 'supertest';
import { describe, expect, onTestFinished, test } from 'vitest';

import { buildApp } from '../../app.js';
import {
  generateJwtToken,
  JWT_COOKIE_NAME,
} from '../user-authentication/user-authentication-helpers.js';
import { createPopulatedUserProfile } from './user-profile-factories.js';
import {
  deleteUserProfileFromDatabaseById,
  retrieveUserProfileFromDatabaseByEmail,
  saveUserProfileToDatabase,
  type UserProfile,
} from './user-profile-model.js';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function setup(numberOfProfiles = 1) {
  const app = buildApp();

  const profiles: UserProfile[] = [];
  for (let i = 0; i < numberOfProfiles; i += 1) {
    const profile = await saveUserProfileToDatabase(
      createPopulatedUserProfile(),
    );
    profiles.push(profile);
    await sleep(100);
  }

  const token = generateJwtToken(profiles[0]!);

  onTestFinished(async () => {
    try {
      await Promise.all(
        profiles.map(profile => deleteUserProfileFromDatabaseById(profile.id)),
      );
    } catch {
      // Игнорируем ошибки если профили уже удалены
    }
  });

  return {
    app,
    token,
    profiles: profiles.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    ),
  };
}

describe('/api/v1/user-profiles', () => {
  describe('/', () => {
    describe('GET', () => {
      test('дано: неаутентифицированный запрос, ожидается: возврат статуса 401', async () => {
        const { app } = await setup();

        const { status: actual } = await request(app).get(
          '/api/v1/user-profiles',
        );
        const expected = 401;

        expect(actual).toEqual(expected);
      });

      test('дано: существует несколько профилей, ожидается: возврат статуса 200 с пагинированными профилями', async () => {
        const { app, profiles, token } = await setup(3);
        const [first, second] = profiles as [UserProfile, UserProfile];

        const actual = await request(app)
          .get('/api/v1/user-profiles')
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .query({ page: 1, pageSize: 2 })
          .expect(200);

        expect(actual.body).toHaveLength(2);
        expect(actual.body[0].id).toEqual(first.id);
        expect(actual.body[1].id).toEqual(second.id);
      });

      test('дано: параметры поисковой строки отсутствуют, ожидается: возврат статуса 200 с дефолтными значениями пагинации', async () => {
        const { app, profiles, token } = await setup(15);

        const actual = await request(app)
          .get('/api/v1/user-profiles')
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .expect(200);

        expect(actual.body).toHaveLength(10);
      });
    });
  });

  describe('/:id', () => {
    describe('GET', () => {
      test('дано: неаутентифицированный запрос, ожидается: возврат статуса 401', async () => {
        const { app, profiles } = await setup();
        const [profile] = profiles as [UserProfile];

        const { status: actual } = await request(app).get(
          `/api/v1/user-profiles/${profile.id}`,
        );
        const expected = 401;

        expect(actual).toEqual(expected);
      });

      test('дано: профиль существует, ожидается: возврат статуса 200 с профилем', async () => {
        const { app, profiles, token } = await setup();
        const [profile] = profiles as [UserProfile];

        const actual = await request(app)
          .get(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .expect(200);

        expect(actual.body.id).toEqual(profile.id);
        expect(actual.body.email).toEqual(profile.email);
      });

      test('дано: профиля не существует, ожидается: возврат статуса 404 с сообщением об ошибке', async () => {
        const { app, token } = await setup();
        const nonExistentId = createId();
        const actual = await request(app)
          .get(`/api/v1/user-profiles/${nonExistentId}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .expect(404);

        expect(actual.body.message).toEqual('Not Found');
      });
    });

    describe('PATCH', () => {
      test('дано: неаутентифицированный запрос, ожидается: возврат статуса 401', async () => {
        const { app, profiles } = await setup();
        const [profile] = profiles as [UserProfile];
        const updates = { name: 'Updated Name' };

        const { status: actual } = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .send(updates);
        const expected = 401;

        expect(actual).toEqual(expected);
      });

      test('дано: профиль существует и новые данные валидны, ожидается: возврат статуса 200 с обновленным профилем', async () => {
        const { app, profiles, token } = await setup();
        const [profile] = profiles as [UserProfile];

        const updates = { name: 'Updated Name' };
        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .send(updates)
          .expect(200);

        expect(actual.body.name).toEqual(updates.name);
        expect(actual.body.id).toEqual(profile.id);
      });

      test('дано: невалидный id, ожидается: возврат статуса 404 с сообщением об ошибке', async () => {
        const { app, token } = await setup();
        const updates = { name: 'Updated Name' };
        const nonExistentId = createId();

        const actual = await request(app)
          .patch(`/api/v1/user-profiles/${nonExistentId}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .send(updates)
          .expect(404);

        expect(actual.body.message).toEqual('Not Found');
      });
    });

    describe('DELETE', () => {
      test('дано: неаутентифицированный запрос, ожидается: возврат статуса 401', async () => {
        const { app, profiles } = await setup();
        const [profile] = profiles as [UserProfile];

        const { status: actual } = await request(app).delete(
          `/api/v1/user-profiles/${profile.id}`,
        );
        const expected = 401;

        expect(actual).toEqual(expected);
      });

      test('дано: профиль существует, ожидается: возврат статуса 200 с удаленным профилем', async () => {
        const { app, profiles, token } = await setup();
        const [profile] = profiles as [UserProfile];

        const actual = await request(app)
          .delete(`/api/v1/user-profiles/${profile.id}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .expect(200);

        expect(actual.body.id).toEqual(profile.id);
      });

      test('дано: профиля не существует, ожидается: возврат статуса 404 с сообщением об ошибке', async () => {
        const { app, token } = await setup();
        const nonExistentId = createId();

        const actual = await request(app)
          .delete(`/api/v1/user-profiles/${nonExistentId}`)
          .set('Cookie', [`${JWT_COOKIE_NAME}=${token}`])
          .expect(404);

        expect(actual.body.message).toEqual('Not Found');
      });
    });
  });
});
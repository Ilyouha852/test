import type { Request, Response } from 'express';
import { z } from 'zod';

import { requireAuthentication } from '../../middleware/require-authentication.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../middleware/validate.js';
import { getErrorMessage } from '../../utils/get-error-message.js';
import {
  deleteUserProfileFromDatabaseById,
  retrieveManyUserProfilesFromDatabase,
  retrieveUserProfileFromDatabaseById,
  updateUserProfileInDatabaseById,
} from './user-profile-model.js';

export async function getAllUserProfiles(request: Request, response: Response) {
  // Middleware уже проверил аутентификацию в роутах
  const query = await validateQuery(
    z.object({
      page: z.coerce.number().positive().default(1),
      pageSize: z.coerce.number().positive().default(10),
    }),
    request,
    response,
  );

  const profiles = await retrieveManyUserProfilesFromDatabase({
    page: query.page,
    pageSize: query.pageSize,
  });

  response.status(200).json(profiles);
}

export async function getUserProfileById(request: Request, response: Response) {
  // Middleware уже проверил аутентификацию в роутах
  const { id } = await validateParams(
    z.object({ id: z.string().min(1) }),
    request,
    response,
  );
  const profile = await retrieveUserProfileFromDatabaseById(id);

  if (profile) {
    response.status(200).json(profile);
  } else {
    response.status(404).json({ message: 'Не найдено' });
  }
}

export async function updateUserProfile(request: Request, response: Response) {
  // Middleware уже проверил аутентификацию в роутах
  const { id } = await validateParams(
    z.object({ id: z.string().min(1) }),
    request,
    response,
  );

  const body = await validateBody(
    z.object({
      email: z.string().email().optional(),
      name: z.string().min(1).optional(),
    }),
    request,
    response,
  );

  if (Object.keys(body).length === 0) {
    response.status(400).json({ message: 'Нет валидных полей для обновления' });
    return;
  }

  try {
    // Filter out undefined values for exactOptionalPropertyTypes
    const updateData: { email?: string; name?: string } = {};
    if (body.email !== undefined) updateData.email = body.email;
    if (body.name !== undefined) updateData.name = body.name;

    const updatedProfile = await updateUserProfileInDatabaseById({
      id,
      data: updateData,
    });

    if (updatedProfile) {
      response.status(200).json(updatedProfile);
    } else {
      response.status(404).json({ message: 'Не найдено' });
    }
  } catch (error) {
    const message = getErrorMessage(error);
    response.status(400).json({ message });
  }
}

export async function deleteUserProfile(request: Request, response: Response) {
  // Middleware уже проверил аутентификацию в роутах
  const { id } = await validateParams(
    z.object({ id: z.string().min(1) }),
    request,
    response,
  );

  try {
    const deletedProfile = await deleteUserProfileFromDatabaseById(id);

    if (deletedProfile) {
      response.status(200).json(deletedProfile);
    } else {
      response.status(404).json({ message: 'Не найдено' });
    }
  } catch (error) {
    const message = getErrorMessage(error);
    response.status(400).json({ message });
  }
}

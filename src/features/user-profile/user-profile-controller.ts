import type { Request, Response } from 'express';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.js';
import {
  createUserProfileSchema,
  updateUserProfileSchema,
  getUserProfilesQuerySchema,
  userProfileParamsSchema,
} from './user-profile-schemas.js';
import {
  saveUserProfileToDatabase,
  retrieveUserProfileFromDatabaseById,
  retrieveManyUserProfilesFromDatabase,
  updateUserProfileInDatabaseById,
  deleteUserProfileFromDatabaseById,
} from './user-profile-model.js';

export async function createUserProfile(request: Request, response: Response) {
  const validatedData = await validateBody(createUserProfileSchema, request, response);
  const { email, name, password } = validatedData;
  
  const userProfile = await saveUserProfileToDatabase({
    email,
    name,
    hashedPassword: `hashed_${password}`, // В реальном приложении нужно хешировать
  });
  
  response.status(201).json(userProfile);
}

export async function getUserProfileById(request: Request, response: Response) {
  const { id } = await validateParams(userProfileParamsSchema, request, response);
  const userProfile = await retrieveUserProfileFromDatabaseById(id);
  
  if (!userProfile) {
    return response.status(404).json({ error: 'User profile not found' });
  }
  
  response.json(userProfile);
}

export async function getUserProfiles(request: Request, response: Response) {
  const query = await validateQuery(getUserProfilesQuerySchema, request, response);
  const page = query.page || 1;
  const pageSize = query.pageSize || 10;
  
  const userProfiles = await retrieveManyUserProfilesFromDatabase({
    page,
    pageSize,
  });
  
  response.json(userProfiles);
}

export async function updateUserProfile(request: Request, response: Response) {
  const { id } = await validateParams(userProfileParamsSchema, request, response);
  const updateData = await validateBody(updateUserProfileSchema, request, response);
  
  const updatedProfile = await updateUserProfileInDatabaseById({
    id,
    data: updateData,
  });
  
  if (!updatedProfile) {
    return response.status(404).json({ error: 'User profile not found' });
  }
  
  response.json(updatedProfile);
}

export async function deleteUserProfile(request: Request, response: Response) {
  const { id } = await validateParams(userProfileParamsSchema, request, response);
  const deletedProfile = await deleteUserProfileFromDatabaseById(id);
  
  if (!deletedProfile) {
    return response.status(404).json({ error: 'User profile not found' });
  }
  
  response.json({ message: 'User profile deleted successfully' });
}
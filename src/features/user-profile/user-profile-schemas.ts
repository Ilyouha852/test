import { z } from 'zod';

export const createUserProfileSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateUserProfileSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
});

export const getUserProfilesQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  pageSize: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
});

export const userProfileParamsSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});
import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { requireAuthentication } from '../../middleware/require-authentication.js';
import {
  deleteUserProfile,
  getAllUserProfiles,
  getUserProfileById,
  updateUserProfile,
} from './user-profile-controller.js';

const router = Router();

// Все роуты защищены аутентификацией
router.get('/', requireAuthentication, asyncHandler(getAllUserProfiles));
router.get('/:id', requireAuthentication, asyncHandler(getUserProfileById));
router.patch('/:id', requireAuthentication, asyncHandler(updateUserProfile));
router.delete('/:id', requireAuthentication, asyncHandler(deleteUserProfile));

export { router as userProfileRoutes};
import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import {
  createUserProfile,
  getUserProfileById,
  getUserProfiles,
  updateUserProfile,
  deleteUserProfile,
} from './user-profile-controller.js';

const router = Router();

router.post('/', asyncHandler(createUserProfile));
router.get('/', asyncHandler(getUserProfiles));
router.get('/:id', asyncHandler(getUserProfileById));
router.put('/:id', asyncHandler(updateUserProfile));
router.delete('/:id', asyncHandler(deleteUserProfile));

export { router as userProfileRoutes };
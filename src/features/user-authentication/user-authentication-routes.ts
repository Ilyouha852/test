import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { requireAuthentication } from '../../middleware/require-authentication.js';
import { login, register, logout, getMe } from './user-authentication-controller.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));
router.post('/logout', asyncHandler(logout));
router.get('/me', requireAuthentication, asyncHandler(getMe)); // ← добавляем middleware

export { router as userAuthenticationRoutes };
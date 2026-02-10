import { Router } from 'express';

import { requireAuthentication } from '../../middleware/require-authentication.js';
import { asyncHandler } from '../../utils/async-handler.js';
import {
    getMe,
    login,
    logout,
    register,
} from './user-authentication-controller.js';

const router = Router();

router.post(
    '/login',
    asyncHandler(async (req, res) => {
        await login(req, res);
    }),
);
router.post(
    '/register',
    asyncHandler(async (req, res) => {
        await register(req, res);
    }),
);
router.post(
    '/logout',
    asyncHandler(async (req, res) => {
        await logout(req, res);
    }),
);
router.get(
    '/me',
    requireAuthentication,
    asyncHandler(async (req, res) => {
        await getMe(req, res);
    }),
); // ← добавляем middleware

export { router as userAuthenticationRoutes };

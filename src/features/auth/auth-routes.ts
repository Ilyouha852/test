import { Router } from 'express';

import { asyncHandler } from '../../utils/async-handler.js';
import { clearCookie, getCookies, setCookie } from './auth-controller.js';

const router = Router();

router.post('/set-cookie', asyncHandler(setCookie));
router.get('/cookies', asyncHandler(getCookies));
router.post('/clear-cookie', asyncHandler(clearCookie));

export { router as authRoutes };

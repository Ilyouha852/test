import { Router } from 'express';

import counterService from '../../services/counter-service.js';
import { asyncHandler } from '../../utils/async-handler.js';

const router = Router();

// Получить текущее значение счётчика
router.get(
    '/',
    asyncHandler(async (request, response) => {
        const count = await counterService.getCurrentCount();
        response.json({
            success: true,
            count,
            message: 'Current counter value',
        });
    }),
);

// Увеличить счётчик
router.post(
    '/increment',
    asyncHandler(async (request, response) => {
        const newCount = await counterService.incrementCounter();
        response.json({
            success: true,
            count: newCount,
            message: 'Counter incremented successfully',
        });
    }),
);

// Сбросить счётчик
router.post(
    '/reset',
    asyncHandler(async (request, response) => {
        await counterService.resetCounter();
        response.json({
            success: true,
            count: 0,
            message: 'Counter reset successfully',
        });
    }),
);

export default router;

import { Router } from 'express';

import { asyncHandler } from '../../utils/async-handler.js';
import repairBotController from './repair-bot-controller.js';

const router = Router();

router.post(
    '/sessions/:userId/start',
    asyncHandler(async (request, response) => {
        const userId = request.params.userId as string;
        const result = await repairBotController.startSession(userId);
        response.json(result);
    }),
);

router.post(
    '/sessions/:userId/event',
    asyncHandler(async (request, response) => {
        const userId = request.params.userId as string;
        const { type, problem, details } = request.body as {
            type: string;
            problem?: string;
            details?: string;
        };

        // Create event object without undefined values
        const event: { type: string; problem?: string; details?: string } = {
            type,
        };
        if (problem !== undefined) event.problem = problem;
        if (details !== undefined) event.details = details;

        const result = await repairBotController.sendEvent(userId, event);
        response.json(result);
    }),
);

router.get(
    '/sessions/:userId/state',
    asyncHandler(async (request, response) => {
        const userId = request.params.userId as string;
        const result = await repairBotController.getState(userId);
        response.json(result);
    }),
);

router.delete(
    '/sessions/:userId',
    asyncHandler(async (request, response) => {
        const userId = request.params.userId as string;
        const result = await repairBotController.endSession(userId);
        response.json(result);
    }),
);

export default router;

import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import repairBotController from './repairBotController.js';

const router = Router();

router.get('/', 
  asyncHandler(async (request, response) => {
    response.json({
      message: 'Repair Bot API',
      endpoints: [
        'POST /sessions/:userId/start - Start session',
        'POST /sessions/:userId/event - Send event', 
        'GET /sessions/:userId/state - Get state',
        'DELETE /sessions/:userId - End session'
      ]
    });
  })
);

router.post('/sessions/:userId/start', 
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const result = await repairBotController.startSession(userId);
    response.json(result);
  })
);

router.post('/sessions/:userId/event',
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const { type } = request.body;
    
    const result = await repairBotController.sendEvent(userId, { type });
    response.json(result);
  })
);

router.get('/sessions/:userId/state',
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const result = await repairBotController.getState(userId);
    response.json(result);
  })
);

router.delete('/sessions/:userId',
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const result = await repairBotController.endSession(userId);
    response.json(result);
  })
);

export default router;
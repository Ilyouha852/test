import { Router } from 'express';

import MainBotController from './controllers/main-bot-controller.js';
import { messengerAggregator } from './modules/messenger-aggregator/messenger-aggregator.js';

const mainBotController = new MainBotController(messengerAggregator);

export const apiV1Router = Router();

apiV1Router.get('/health-check', (_req, res) => {
    res.status(200).json({ status: 'OK' });
});

apiV1Router.post('/user_message', (req, res) => {
    void mainBotController.handleWebhook(req, res);
});

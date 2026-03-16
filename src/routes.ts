import { Router } from 'express';

export const apiV1Router = Router();

apiV1Router.get('/health-check', (_req, res) => {
    res.status(200).json({ status: 'OK' });
});

// apiV1Router.use('/health-check', healthCheckRoutes);

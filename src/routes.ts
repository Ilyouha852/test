import { Router } from 'express';
import { healthCheckRoutes } from './features/health-check/health-check-routes.js';
import { userProfileRoutes } from './features/user-profile/user-profile-routes.js';
import { authRoutes } from './features/auth/auth-routes.js';

export const apiV1Router = Router();

// Корневой роут для API v1
apiV1Router.get('/', (req, res) => {
  res.json({ 
    message: '🤖 Support Bot IST API',
    version: '1.0',
    endpoints: {
      health: '/api/v1/health-check',
      users: '/api/v1/user-profiles',
      auth: '/api/v1/auth'
    }
  });
});

apiV1Router.use('/health-check', healthCheckRoutes);
apiV1Router.use('/user-profiles', userProfileRoutes);
apiV1Router.use('/auth', authRoutes);
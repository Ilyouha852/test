import { Router } from 'express';

import { authRoutes } from './features/auth/auth-routes.js';
import counterRoutes from './features/counter/counter-routes.js';
import { healthCheckRoutes } from './features/health-check/health-check-routes.js';
import repairBotRoutes from './features/repair-bot/repair-bot-routes.js';
import { userAuthenticationRoutes } from './features/user-authentication/user-authentication-routes.js';
import { userProfileRoutes } from './features/user-profile/user-profile-routes.js';

export const apiV1Router = Router();

apiV1Router.use('/health-check', healthCheckRoutes);
apiV1Router.use('/user-profiles', userProfileRoutes);
apiV1Router.use('/auth', authRoutes);
apiV1Router.use(userAuthenticationRoutes);
apiV1Router.use('/repair-bot', repairBotRoutes);
apiV1Router.use('/counter', counterRoutes);

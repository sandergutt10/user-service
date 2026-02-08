import { Router } from 'express';
import { authGuard } from '../../middlewares/auth.middleware';
import { loginHandler, logoutHandler, registerHandler } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);
authRouter.post('/logout', authGuard, logoutHandler);

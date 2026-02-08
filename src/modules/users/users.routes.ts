import { Router } from 'express';
import { authGuard } from '../../middlewares/auth.middleware';
import { blockUserHandler, getUserByIdHandler, getUsersListHandler } from './users.controller';

export const usersRouter = Router();

usersRouter.use(authGuard);
usersRouter.get('/', getUsersListHandler);
usersRouter.get('/:id', getUserByIdHandler);
usersRouter.patch('/:id/block', blockUserHandler);

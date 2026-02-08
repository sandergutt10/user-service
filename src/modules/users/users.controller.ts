import type { Request, Response } from 'express';
import { HttpError } from '../../common/http-error';
import { blockUser, getUserById, getUsersList } from './users.service';

function getPathUserId(req: Request): string {
  const param = req.params.id;
  const userId = Array.isArray(param) ? param[0] : param;
  if (!userId) {
    throw new HttpError(400, 'Необходимо передать id пользователя');
  }

  return userId;
}

function ensureUserCanAccessTarget(targetUserId: string, req: Request): void {
  const actor = req.authUser;
  if (!actor) {
    throw new HttpError(401, 'Требуется авторизация');
  }

  const isAdmin = actor.role === 'admin';
  const isSelf = actor.id === targetUserId;

  if (!isAdmin && !isSelf) {
    throw new HttpError(403, 'Недостаточно прав');
  }
}

export async function getUserByIdHandler(req: Request, res: Response): Promise<void> {
  const targetUserId = getPathUserId(req);
  ensureUserCanAccessTarget(targetUserId, req);

  const user = await getUserById(targetUserId);
  res.status(200).json(user);
}

export async function getUsersListHandler(req: Request, res: Response): Promise<void> {
  const actor = req.authUser;
  if (!actor) {
    throw new HttpError(401, 'Требуется авторизация');
  }

  if (actor.role !== 'admin') {
    throw new HttpError(403, 'Список пользователей доступен только администратору');
  }

  const users = await getUsersList();
  res.status(200).json(users);
}

export async function blockUserHandler(req: Request, res: Response): Promise<void> {
  const targetUserId = getPathUserId(req);
  ensureUserCanAccessTarget(targetUserId, req);

  const user = await blockUser(targetUserId);
  res.status(200).json(user);
}

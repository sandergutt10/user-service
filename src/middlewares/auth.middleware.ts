import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpError } from '../common/http-error';
import { prisma } from '../lib/prisma';
import type { AuthUser } from '../types/auth';

type JwtPayload = {
  sub: string;
};

export async function authGuard(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Отсутствует заголовок авторизации или он некорректен');
  }

  const token = authHeader.slice('Bearer '.length);

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  } catch {
    throw new HttpError(401, 'Недействительный токен');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, isActive: true },
  });

  if (!user) {
    throw new HttpError(401, 'Пользователь из токена не найден');
  }

  if (!user.isActive) {
    throw new HttpError(403, 'Заблокированный пользователь не может получить доступ');
  }

  req.authUser = user satisfies AuthUser;
  next();
}

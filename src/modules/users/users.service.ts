import type { User } from '@prisma/client/index';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../common/http-error';

type PublicUser = Omit<User, 'passwordHash'>;

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function getUserById(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new HttpError(404, 'Пользователь не найден');
  }

  return toPublicUser(user);
}

export async function getUsersList(): Promise<PublicUser[]> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return users.map(toPublicUser);
}

export async function blockUser(userId: string): Promise<PublicUser> {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new HttpError(404, 'Пользователь не найден');
  }

  if (!existingUser.isActive) {
    return toPublicUser(existingUser);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  return toPublicUser(updatedUser);
}

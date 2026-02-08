import { User } from '@prisma/client/index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HttpError } from '../../common/http-error';
import { env } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { loginSchema, registerSchema } from './auth.schemas';

type PublicUser = Omit<User, 'passwordHash'>;

type RegisterInput = ReturnType<typeof registerSchema.parse>;
type LoginInput = ReturnType<typeof loginSchema.parse>;

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

function issueAccessToken(userId: string): string {
  return jwt.sign({}, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'],
  });
}

export async function registerUser(rawInput: unknown): Promise<{ user: PublicUser; accessToken: string }> {
  const input = registerSchema.parse(rawInput);

  if (input.birthDate > new Date()) {
    throw new HttpError(400, 'Дата рождения не может быть в будущем');
  }

  const usersCount = await prisma.user.count();
  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

  const createdUser = await prisma.user.create({
    data: {
      fullName: input.fullName,
      birthDate: input.birthDate,
      email: input.email.toLowerCase(),
      passwordHash,
      role: usersCount === 0 ? 'admin' : 'user',
    },
  });

  return {
    user: toPublicUser(createdUser),
    accessToken: issueAccessToken(createdUser.id),
  };
}

export async function loginUser(rawInput: unknown): Promise<{ user: PublicUser; accessToken: string }> {
  const input = loginSchema.parse(rawInput);

  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    throw new HttpError(401, 'Неверный email или пароль');
  }

  if (!user.isActive) {
    throw new HttpError(403, 'Пользователь заблокирован');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Неверный email или пароль');
  }

  return {
    user: toPublicUser(user),
    accessToken: issueAccessToken(user.id),
  };
}

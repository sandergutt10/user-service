import express from 'express';
import path from 'node:path';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();

app.use(express.json());

const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

app.get('/api', (_req, res) => {
  res.status(200).json({
    service: 'user-service',
    status: 'ok',
    endpoints: ['/health', '/auth/register', '/auth/login', '/auth/logout', '/users'],
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Сервис пользователей запущен на порту ${env.PORT}`);
});

# user-service

Сервис пользователей на `Node.js + Express + TypeScript + Prisma + PostgreSQL`.

## Функциональность

- Регистрация пользователя
- Авторизация (JWT)
- Получение пользователя по `id` (админ или сам пользователь)
- Получение списка пользователей (только админ)
- Блокировка пользователя (админ или сам пользователь)
- Встроенный веб-интерфейс на русском языке

## Технологии

- `express`
- `typescript`
- `prisma` + `@prisma/client` + `@prisma/adapter-pg`
- `postgresql` (через Docker)
- `zod`
- `jsonwebtoken`

## Быстрый старт

### 1. Установить зависимости

```bash
npm install
```

### 2. Запустить PostgreSQL

```bash
docker compose up -d postgres
```

### 3. Применить миграции

```bash
npx prisma migrate dev --name init
```

### 4. Запустить проект

```bash
npm run dev
```

Сервис будет доступен по адресу: `http://localhost:3000`

## Переменные окружения

Файл: `.env`

```env
PORT=3000
DATABASE_URL="postgresql://app:app@localhost:5433/user-service?schema=public"
JWT_ACCESS_SECRET="1234567890987654321"
JWT_ACCESS_TTL="45m"
BCRYPT_ROUNDS=10
```

## Скрипты

- `npm run dev` — запуск в режиме разработки
- `npm run build` — сборка TypeScript в `dist`
- `npm run start` — запуск собранного проекта
- `npm run lint` — линтинг
- `npm run format` — форматирование

## API

### Технические endpoint

- `GET /` — веб-интерфейс
- `GET /api` — информация о сервисе
- `GET /health` — health-check

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout` (требуется `Bearer` токен)

### Users

- `GET /users` — только админ
- `GET /users/:id` — админ или владелец аккаунта
- `PATCH /users/:id/block` — админ или владелец аккаунта

## Роли и права

- Первый зарегистрированный пользователь получает роль `admin`
- Все последующие пользователи получают роль `user`

## Интерфейс

Веб-интерфейс доступен по адресу `http://localhost:3000`:

- вкладки: Панель / Доступ / Пользователи
- работа с токеном (сохранение в `localStorage`)
- формы для всех основных операций API

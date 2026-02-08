import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: 'Укажите ФИО' })
    .max(255, { message: 'ФИО не должно превышать 255 символов' }),
  birthDate: z
    .string()
    .trim()
    .min(1, { message: 'Укажите дату рождения' })
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: 'Некорректная дата рождения',
    })
    .transform((value) => new Date(value)),
  email: z.string().trim().email({ message: 'Некорректный email' }),
  password: z
    .string()
    .min(8, { message: 'Пароль должен содержать минимум 8 символов' })
    .max(72, { message: 'Пароль не должен превышать 72 символа' }),
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Некорректный email' }),
  password: z.string().min(1, { message: 'Введите пароль' }),
});

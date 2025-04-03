import { z } from 'zod';

export const passwordSchema = z.string()
  .min(6, 'Пароль должен содержать не менее 6 символов')
  .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
  .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
  .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
  .regex(/^[a-zA-Z0-9]+$/, 'Пароль должен содержать только латинские буквы');

export const formLoginSchema = z.object({
  email: z.string().email('Введите корректную почту'),
  password: passwordSchema,
});

export const formRegisterSchema = formLoginSchema.merge(z.object({
  name: z.string().min(2, 'Введите имя'),
  phone: z.string().optional(),
  confirmPassword: passwordSchema,
})).refine(data => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

export type TFormLoginValues = z.infer<typeof formLoginSchema>;
export type TFormRegisterValues = z.infer<typeof formRegisterSchema>;
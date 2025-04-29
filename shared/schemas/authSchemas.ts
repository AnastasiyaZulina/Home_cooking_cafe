import { z } from 'zod';

export const passwordSchema = z.string()
  .min(6, 'Пароль должен содержать не менее 6 символов')
  .max(100, 'Пароль не должен превышать 100 символов')
  .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
  .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
  .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
  .regex(/^[a-zA-Z0-9]+$/, 'Пароль должен содержать только латинские буквы');

export const formLoginSchema = z.object({
  email: z.string().email('Введите корректную почту').max(100, 'Email не должен превышать 100 символов'),
  password: passwordSchema,
});

export const formRegisterSchema = formLoginSchema.merge(z.object({
  name: z.string()
    .min(2, 'Имя должно содержать не менее 2 символов')
    .max(50, 'Имя не должно превышать 50 символов'),
  confirmPassword: passwordSchema,
}));

export const formUpdateUserWithPasswordSchema = z.object({
  name: z.string()
    .min(2, 'Имя должно содержать не менее 2 символов')
    .max(50, 'Имя не должно превышать 50 символов'),
  phone: z.string()
    .max(20, 'Телефон не должен превышать 20 символов')
    .regex(/^$|^\+7\d{10}$/, "Формат: +7XXXXXXXXXX")
    .optional().nullable(),
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: passwordSchema.optional(),
  confirmPassword: passwordSchema.optional(),
}).refine(data => {
  if (data.newPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export const formUpdateGoogleUserSchema = z.object({
  name: z.string()
    .min(2, 'Имя должно содержать не менее 2 символов')
    .max(50, 'Имя не должно превышать 50 символов'),
  phone: z.string()
  .max(20, 'Телефон не должен превышать 20 символов')
    .regex(/^$|^\+7\d{10}$/, "Формат: +7XXXXXXXXXX")
    .optional().nullable(),
  newPassword: passwordSchema.min(1, 'Новый пароль обязателен'), // Обязательное поле
  confirmPassword: passwordSchema.min(1, 'Подтверждение пароля обязательно'),
}).refine(data => {
  if (data.newPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export type TFormUpdateUserWithPasswordValues = z.infer<typeof formUpdateUserWithPasswordSchema>;
export type TFormLoginValues = z.infer<typeof formLoginSchema>;
export type TFormRegisterValues = z.infer<typeof formRegisterSchema>;
export type TFormUpdateGoogleValues = z.infer<typeof formUpdateGoogleUserSchema>;
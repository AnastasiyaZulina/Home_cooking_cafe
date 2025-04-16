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
    phone: z.string()
      .regex(/^$|^\+7\d{10}$/, "Формат: +7XXXXXXXXXX") // Разрешаем пустую строку или корректный номер
      .optional().nullable(),
    confirmPassword: passwordSchema,
  }));
  
  export const formUpdateUserWithPasswordSchema = z.object({
    name: z.string().min(2, 'Введите имя'),
    phone: z.string()
      .regex(/^$|^\+7\d{10}$/, "Формат: +7XXXXXXXXXX")
      .optional().nullable(),
    currentPassword: z.string().min(1, 'Текущий пароль обязателен'), // Обязательное поле
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
  name: z.string().min(2, 'Введите имя'),
  phone: z.string()
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
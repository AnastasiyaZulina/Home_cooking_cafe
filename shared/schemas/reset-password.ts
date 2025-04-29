import { z } from "zod";

export const resetPasswordSchema = z.object({
    password: z.string()
    .min(8, 'Пароль должен содержать не менее 8 символов')
    .max(100, 'Пароль не должен превышать 100 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
    .regex(/^[a-zA-Z0-9]+$/, 'Пароль должен содержать только латинские буквы и цифры'),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

  export type TResetPasswordValues = z.infer<typeof resetPasswordSchema>;


  
  export const forgotPasswordSchema = z.object({
    email: z.string().email('Введите корректную почту').max(100, 'Email не должен превышать 100 символов'),
  });
  
  export type TForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
import {z} from 'zod' 

export const passwordSchema = z.string().min(6, {
    message: 'Пароль должен содержать не менее 6 символов'
});

export const formLoginSchema = z.object({
    email: z.string().email({message: 'Введите корректную почту'}),
    password: passwordSchema,
});

export const formRegisterSchema = formLoginSchema.merge(z.object({
    name: z.string().min(2, {message: 'Введите имя'}),
    confirmPassword: passwordSchema,
})).refine(data => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
});

export type TFormLoginValues = z.infer<typeof formLoginSchema>;
export type TFormRegisterValues = z.infer<typeof formRegisterSchema>;
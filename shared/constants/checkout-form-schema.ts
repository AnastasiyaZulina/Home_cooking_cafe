import {z} from 'zod';

export const CheckoutFormSchema = z.object({
    firstname: z.string().min(2, {message:'Имя должно содержать не менее двух символов'}),
    lastname: z.string().min(2, {message:'Фамилия должна содержать не менее двух символов'}),
    email: z.string().email({message:'Введите корректную почту'}),
    phone: z.string().min(10, {message:'Введите корректный номер телефона'}),
    address: z.string().min(5, {message:'Введите корректный адрес'}),
    comment: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof CheckoutFormSchema>;
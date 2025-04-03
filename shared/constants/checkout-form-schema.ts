import { DeliveryType, PaymentMethod } from '@prisma/client';
import { z } from 'zod';

export const CheckoutFormSchema = z.object({
    firstname: z.string().min(2, {message:'Имя должно содержать не менее двух символов'}),
    email: z.string().email({message:'Введите корректную почту'}),
    phone: z
        .string()
        .refine((val) => /^\+7\d{10}$/.test(val), {
            message: 'Введите корректный номер телефона',
        }),
    address: z.string().optional(),
    comment: z.string().optional(),
    deliveryType: z.nativeEnum(DeliveryType),
    paymentMethod: z.nativeEnum(PaymentMethod).default('ONLINE'),
    deliveryPrice: z.number().optional().default(0),
    bonusDelta: z.number().optional().default(0),
    deliveryTime: z.date(),
}).superRefine((data, ctx) => {
    if (data.deliveryType === 'DELIVERY') {
        if (!data.address || data.address.length < 5) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Введите корректный адрес",
                path: ["address"]
            });
        }
    }
});

export type CheckoutFormValues = z.infer<typeof CheckoutFormSchema>;
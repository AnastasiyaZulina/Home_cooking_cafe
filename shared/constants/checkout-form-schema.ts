import { DeliveryType, PaymentMethod } from '@prisma/client';
import { z } from 'zod';

export const CheckoutFormSchema = z.object({
    name: z.string()
        .min(2, 'Имя должно содержать не менее двух символов')
        .max(50, 'Имя не должно превышать 50 символов'),
    email: z.string()
        .email('Введите корректную почту')
        .max(100, 'Почта не должна превышать 100 символов'),
    phone: z
        .string().max(20, 'Телефон не должен превышать 20 символов')
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
        if (!data.address || data.address.trim().length < 5) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Введите корректный адрес (минимум 5 символов)",
                path: ["address"]
            });
        } else if (data.address.length > 255) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Адрес не должен превышать 255 символов",
                path: ["address"]
            });
        }
    }
});

export type CheckoutFormValues = z.infer<typeof CheckoutFormSchema>;
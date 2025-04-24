import { z } from 'zod';
import { DeliveryType, PaymentMethod, OrderStatus } from '@prisma/client';

export const OrderFormSchema = z.object({
  userId: z.number().optional(),
  name: z.string().min(2, { message: 'Имя должно содержать не менее двух символов' }).max(50, { message: 'Имя не должно превышать 50 символов' }),
  email: z.string().email({ message: 'Введите корректную почту' }).max(100, { message: 'Почта не должна превышать 100 символов' }),
  phone: z.string().min(11, { message: 'Введите корректный номер телефона' }).max(20, { message: 'Телефон не должен превышать 20 символов' }),
  address: z.string().max(255, { message: 'Адрес не должен превышать 255 символов' }).optional().nullable(),
  deliveryType: z.nativeEnum(DeliveryType),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryPrice: z.number().optional().default(0),
  paymentId: z.string().max(100, { message: 'ID платежа не должен превышать 100 символов' }).optional().nullable(),
  status: z.nativeEnum(OrderStatus, {message: "Выберите статус заказа"}),
  comment: z.string().optional().nullable(),
  deliveryTime: z.preprocess(
    (arg) => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    },
    z.date()
  ),
  bonusDelta: z.number().default(0),
  items: z.array(
    z.object({
      productId: z.number().min(1, "Выберите товар"),
      quantity: z.number().min(1),
      productName: z.string(),
      stockQuantity: z.number(),
      productPrice: z.number()
    }).refine(data => data.quantity <= data.stockQuantity, {
      message: "Количество превышает доступный запас",
      path: ["quantity"]
    })
  ).nonempty("Добавьте хотя бы один товар")
});

export const OrderUpdateFormSchema = z.object({
  userId: z.number().optional().nullable(),
  name: z.string().min(2, { message: 'Имя должно содержать не менее двух символов' }).max(50, { message: 'Имя не должно превышать 50 символов' }),
  email: z.string().email({ message: 'Введите корректную почту' }).max(100, { message: 'Почта не должна превышать 100 символов' }),
  phone: z.string().min(11, { message: 'Введите корректный номер телефона' }).max(20, { message: 'Телефон не должен превышать 20 символов' }),
  address: z.string().max(255, { message: 'Адрес не должен превышать 255 символов' }).optional().nullable(),
  deliveryType: z.nativeEnum(DeliveryType),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryCost: z.number().optional().default(0),
  paymentId: z.string().max(100, { message: 'ID платежа не должен превышать 100 символов' }).optional().nullable(),
  status: z.nativeEnum(OrderStatus, {message: "Выберите статус заказа"}),
  comment: z.string().optional().nullable(),
  deliveryTime: z.preprocess(
    (arg) => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    },
    z.date()
  ),
  bonusDelta: z.number().default(0),
  items: z.array(
    z.object({
      productId: z.number().min(1, "Выберите товар"),
      quantity: z.number().min(1, "Минимальное количество товара 1"),      
      productName: z.string(),
      stockQuantity: z.number(),
      productPrice: z.number(),
    })
  ).min(0)
});

export type OrderFormValues = z.infer<typeof OrderFormSchema>;
export type OrderUpdateFormValues = z.infer<typeof OrderUpdateFormSchema>;
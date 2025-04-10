import { z } from 'zod';
import { DeliveryType, PaymentMethod, OrderStatus } from '@prisma/client';

export const OrderFormSchema = z.object({
  userId: z.number().optional(),
  name: z.string().min(2, { message: 'Имя должно содержать не менее двух символов' }),
  email: z.string().email({ message: 'Введите корректную почту' }),
  phone: z.string().min(11, { message: 'Введите корректный номер телефона' }),
  address: z.string().optional(),
  deliveryType: z.nativeEnum(DeliveryType),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryPrice: z.number().optional().default(0),
  paymentId: z.string().optional(),
  status: z.nativeEnum(OrderStatus),
  comment: z.string().optional(),
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
  name: z.string().min(2, { message: 'Имя должно содержать не менее двух символов' }),
  email: z.string().email({ message: 'Введите корректную почту' }),
  phone: z.string().min(11, { message: 'Введите корректный номер телефона' }),
  address: z.string().optional().nullable(),
  deliveryType: z.nativeEnum(DeliveryType),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryPrice: z.number().optional().default(0),
  paymentId: z.string().optional().nullable(),
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
  ).min(0) // Разрешаем пустой массив
});

export type OrderFormValues = z.infer<typeof OrderFormSchema>;
export type OrderUpdateFormValues = z.infer<typeof OrderUpdateFormSchema>;
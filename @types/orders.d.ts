import { PaymentMethod, DeliveryType, OrderStatus } from "@prisma/client";

export type Order = {
  id: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  deliveryTime: Date;
  deliveryCost: number;
  userId?: number;
  bonusDelta: number;
  name: string;
  address?: string;
  email: string;
  phone: string;
  comment?: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
};

export type OrderItem = {
  productId: number;
  productName: string;
  productQuantity: number;
  productPrice: number;
};

export type OrderItemWithProduct = OrderItem & {
  product: {
    stockQuantity: number;
    name: string;
    price: number;
  };
};

export type OrderWithProducts = Omit<Order, 'items'> & {
  items: OrderItemWithProduct[];
};

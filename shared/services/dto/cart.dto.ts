import { Cart, CartItem, Product } from '@prisma/client';

export type CartItemDTO = CartItem & {product: Product};

export interface CartDTO extends Cart {
  items: CartItemDTO[];
};

export interface CreateCartItemValues {
  productId: number;
  quantity?: number;
}

export interface RepeatOrderResponse {
  success: { name: string }[];
  removed: { name: string }[];
  adjusted: { name: string, originalQty: number, newQty: number }[];
}

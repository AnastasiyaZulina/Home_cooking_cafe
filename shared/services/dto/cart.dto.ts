import { Cart, CartItem, Product } from '@prisma/client';

export type CartItemDTO = CartItem & {product: Product};

export interface CartDTO extends Cart {
  items: CartItemDTO[];
};

export interface CreateCartItemValues {
  productId: number;
}
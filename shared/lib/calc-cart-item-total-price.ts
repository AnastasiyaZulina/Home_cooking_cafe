import {Product} from '@prisma/client';
import { CartItemDTO } from '../services/dto/cart.dto';
import { CartStateItem } from './get-cart-details';

export const calcCartItemTotalPrice = (item: CartItemDTO): number => {
  return (item.product.price * item.quantity);
};
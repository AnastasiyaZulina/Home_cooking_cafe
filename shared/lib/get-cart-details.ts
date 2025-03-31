import { Cart } from "@prisma/client";
import { CartDTO } from "../services/dto/cart.dto";
import { calcCartItemTotalPrice } from "./calc-cart-item-total-price";

export type CartStateItem = {
  id: number;
  productId: number;
  quantity: number;
  name: string;
  weight: number;
  eValue: number;
  image: string;
  price: number;
  disabled?: boolean;
};

type ReturnProps = {
  items: CartStateItem[];
  totalAmount: number;
};

export const getCartDetails = (data: CartDTO): ReturnProps => {
  const items = data.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    productId: item.product.id,
    name: item.product.name,
    weight: item.product.weight,
    eValue: item.product.eValue,
    image: item.product.image,
    price: calcCartItemTotalPrice(item),
    disabled: false,
  })) as CartStateItem[];

  return {
    items,
    totalAmount: data.totalAmount,
  };
};


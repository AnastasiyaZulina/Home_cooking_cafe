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
  stockQuantity: number;
};

type ReturnProps = {
  items: CartStateItem[];
  totalAmount: number;
};

export const getCartDetails = (data: CartDTO): ReturnProps => {
  if (!data || !Array.isArray(data.items)) {
    return { items: [], totalAmount: 0 }; // Возвращаем пустой массив, если данных нет
  }
  const items = data.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    productId: item.product.id,
    name: item.product.name,
    weight: item.product.weight,
    eValue: item.product.eValue,
    image: item.product.image,
    stockQuantity: item.product.stockQuantity,
    isAvailable: item.product.isAvailable,
    price: calcCartItemTotalPrice(item),
    disabled: false,
  })) as CartStateItem[];
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  return {
    items,
    totalAmount,
  };
};


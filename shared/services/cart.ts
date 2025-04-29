import { axiosInstance } from './instance';
import { CartDTO, CreateCartItemValues, RepeatOrderResponse } from './dto/cart.dto';

export const getCart = async (): Promise<CartDTO> => {
  const { data } = await axiosInstance.get<CartDTO>('/cart');

  return data;
};

export const addCartItem = async (values: CreateCartItemValues): Promise<CartDTO> => {
  const { data } = await axiosInstance.post<CartDTO>('/cart', values);

  return data;
};

export const updateItemQuantity = async (id: number, quantity: number): Promise<CartDTO> => {
  const { data } = await axiosInstance.patch<CartDTO>('/cart/' + id, { quantity });

  return data;
};

export const removeCartItem = async (id: number): Promise<CartDTO> => {
  const { data } = await axiosInstance.delete<CartDTO>('/cart/' + id);

  return data;
};

export const mergeCarts = async (data: { cartToken: string }): Promise<CartDTO> => {
  const { data: responseData } = await axiosInstance.post<CartDTO>('/cart/merge', data);
  return responseData;
};

export const repeatCart = async (
  items: Array<{ productId: number, quantity: number }>
): Promise<RepeatOrderResponse> => {
  const { data } = await axiosInstance.post<RepeatOrderResponse>('/cart/repeat', items);
  return data;
};


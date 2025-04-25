import { Order, OrderWithProducts } from '@/@types/orders';
import { axiosInstance } from './instance';
import { OrderFormValues, OrderUpdateFormValues } from '../schemas/order-form-schema';

export const getOrders = async () => {
  const { data } = await axiosInstance.get<Order[]>('/admin/orders');
  return data;
};

export const getOrder = async (id: number) => {
  const { data } = await axiosInstance.get<OrderWithProducts>(`/admin/orders/${id}`);
  return data;
};

export const updateOrder = async (id: number, data: OrderUpdateFormValues) => {
  const response = await axiosInstance.put(`/admin/orders/${id}`, data);
  return response.data;
};

export const deleteOrder = async (id: number) => {
  const { data } = await axiosInstance.delete(`/admin/orders/${id}`);
  return data;
};

export const createOrder = async (orderData: OrderFormValues) => {
    const { data } = await axiosInstance.post<Order>('/admin/orders', {
      ...orderData,
      items: orderData.items as Array<{
        productId: number;
        quantity: number;
        productName: string;
        productPrice: number;
        stockQuantity: number;
      }>
    });
    return data;
  };
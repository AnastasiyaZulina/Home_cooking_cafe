import { axiosInstance } from './instance';
import { Product } from '@/@types/product-types';

export const getProducts = async () => {
    const { data } = await axiosInstance.get<Product[]>('/admin/products');
    return data;
};

export const deleteProduct = async (id: number) => {
    await axiosInstance.delete(`/admin/products/${id}`);
};

export const bulkUpdateStock = async (data: { ids: number[]; quantity: number }) => {
    await axiosInstance.patch('/admin/products/stock', data);
};

export const createProduct = async (formData: FormData) => {
    const { data } = await axiosInstance.post<Product>('/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const updateProduct = async (id: number, formData: FormData) => {
    const { data } = await axiosInstance.patch<Product>(`/admin/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

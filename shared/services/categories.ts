// services/categories.ts
import { Category } from '@prisma/client';
import { axiosInstance } from './instance';

// Получить все категории
export const getCategories = async () => {
  const { data } = await axiosInstance.get<Category[]>('/admin/categories');
  return data;
};

// Создать новую категорию
export const createCategory = async (payload: { name: string; isAvailable: boolean }) => {
  const { data } = await axiosInstance.post<Category>('/admin/categories', payload);
  return data;
};

// Обновить категорию
export const updateCategory = async (id: number, payload: Partial<Category>) => {
  const { data } = await axiosInstance.patch<Category>(`/admin/categories/${id}`, payload);
  return data;
};

// Удалить категорию
export const deleteCategory = async (id: number) => {
  const { data } = await axiosInstance.delete(`/admin/categories/${id}`);
  return data;
};

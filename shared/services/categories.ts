// services/categories.ts
import { axiosInstance } from './instance';

export type Category = {
  id: number;
  name: string;
  isAvailable: boolean;
};

// Получить все категории
export const getCategories = async () => {
  const { data } = await axiosInstance.get<Category[]>('/admin/categories');
  return data;
};

// Создать новую категорию
export const createCategory = async (name: string) => {
  const { data } = await axiosInstance.post<Category>('/admin/categories', {
    name,
  });
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

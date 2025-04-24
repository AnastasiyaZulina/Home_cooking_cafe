import { User } from '@prisma/client';
import { axiosInstance } from './instance';
import { UserFormValues } from '@/@types/user';

export const getUsers = async () => {
  const { data } = await axiosInstance.get<User[]>('/admin/users');
  return data;
};

export const getUser = async (id: number) => {
  const { data } = await axiosInstance.get<User>(`/admin/users/${id}`);
  return data;
};

export const updateUser = async (id: number, payload: Partial<UserFormValues>) => {
    const transformedData = {
      ...payload,
      phone: payload.phone && payload.phone !== '+7' ? payload.phone.trim() : null,
      verified: payload.isVerified ? new Date() : null
    };
  
    const { data } = await axiosInstance.patch<User>(
      `/admin/users/${id}`,
      transformedData
    );
    return data;
  };

  export const createUser = async (payload: UserFormValues) => {
    const transformedData = {
      ...payload,
      phone: payload.phone && payload.phone !== '+7' ? payload.phone.trim() : null,
      verified: payload.isVerified ? new Date() : null
    };
  
    const { data } = await axiosInstance.post<User>(
      '/admin/users',
      transformedData
    );
    return data;
  };

export const deleteUser = async (id: number) => {
  await axiosInstance.delete(`/admin/users/${id}`);
};

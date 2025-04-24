import { axiosInstance } from "./instance";

export const requestPasswordReset = async (email: string) => {
  const { data } = await axiosInstance.post<{ success: boolean }>(
    '/auth/reset-password',
    { email }
  );
  return data;
};

export const confirmPasswordReset = async (token: string, newPassword: string, ) => {
  const { data } = await axiosInstance.post<{ success: boolean }>(
    '/auth/reset-password/confirm',
    { token, password: newPassword }
  );
  return data;
};
import axios from 'axios';
import toast from 'react-hot-toast';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// services/instance.ts
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Произошла ошибка';
    toast.error(message);
    return Promise.reject(new Error(message));
  }
);
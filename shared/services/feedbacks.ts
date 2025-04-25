import { Feedback } from '@/@types/feedback';
import { axiosInstance } from './instance';

export const getFeedbacks = async () => {
  const { data } = await axiosInstance.get<Feedback[]>('/feedbacks');
  return data;
};

export const getVisibleFeedbacks = async () => {
  const { data } = await axiosInstance.get<Feedback[]>('/feedbacks', {
    params: {
      isVisible: true,
      feedbackStatus: 'APPROVED'
    }
  });
  return data;
};

export const updateFeedback = async (id: number, payload: Partial<Feedback>) => {
  const { data } = await axiosInstance.patch<Feedback>(
    `/admin/feedbacks/${id}`,
    payload
  );
  return data;
};

export const deleteFeedback = async (id: number) => {
  await axiosInstance.delete(`/admin/feedbacks/${id}`);
};

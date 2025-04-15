import { axiosInstance } from './instance';

export type Feedback = {
  id: number;
  userId: number;
  user: {
    name: string;
    email: string;
  };
  feedbackText: string;
  feedbackStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
};


export const getFeedbacks = async () => {
  const { data } = await axiosInstance.get<Feedback[]>('/admin/feedbacks');
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

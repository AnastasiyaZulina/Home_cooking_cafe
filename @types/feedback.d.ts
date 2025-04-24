import { FeedbackStatus } from "@prisma/client";

export type FeedbackWithUser = {
  id: number;
  feedbackText: string;
  createdAt: Date;
  user: {
    name: string;
  };
};

export type Feedback = {
  id: number;
  userId: number;
  user: {
    name: string;
    email: string;
  };
  feedbackText: string;
  feedbackStatus: FeedbackStatus;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FeedbackFormValues = {
  feedbackText: string;
  feedbackStatus: FeedbackStatus;
  isVisible: boolean;
};
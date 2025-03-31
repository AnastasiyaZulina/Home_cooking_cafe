export type FeedbackWithUser = {
  id: number;
  feedbackText: string;
  createdAt: Date;
  user: {
    fullName: string;
  };
};
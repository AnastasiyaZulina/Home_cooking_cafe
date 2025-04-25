import { z } from "zod";

export const FeedbackFormSchema = z.object({
    feedbackText: z.string().min(10, "Отзыв должен содержать минимум 10 символов").max(1000, "Отзыв может содержать максимум 1000 символов")
});

export type FeedbackUserFormValues = z.infer<typeof FeedbackFormSchema>;
'use client';

import { Container, FormInput, FormTextarea, Title } from "@/shared/components";
import { Button } from "@/shared/components/ui";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import toast from "react-hot-toast";

import { z } from "zod";
import { useEffect, useState } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { FeedbackWithUser } from "@/@types/feedback";
import { createFeedback, getFeedbacks } from "@/app/actions";
import { GrayBlock } from "@/shared/components/shared/gray-block";

const FeedbackFormSchema = z.object({
    feedbackText: z.string().min(10, "Отзыв должен содержать минимум 10 символов")
});

type FeedbackFormValues = z.infer<typeof FeedbackFormSchema>;

export default function FeedbackPage() {
    const { status } = useSession();
    const [feedbacks, setFeedbacks] = useState<FeedbackWithUser[]>([]);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const loadFeedbacks = async () => {
            try {
                const data = await getFeedbacks();
                setFeedbacks(data);
            } catch (error) {
                console.error('Ошибка загрузки отзывов:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFeedbacks();
    }, []);

    return (
        <Container className="mt-6 md:mt-10 px-4 sm:px-6">
            <Title
                text="Отзывы"
                className="font-extrabold mb-6 md:mb-8 text-2xl sm:text-3xl md:text-[36px] text-center"
            />

            {status === 'unauthenticated' && (
                <GrayBlock className="mb-8 p-6 text-center">
                    <div className="space-y-4">
                        <p className="text-lg font-medium">
                            Чтобы оставить отзыв, пожалуйста, авторизуйтесь
                        </p>
                    </div>
                </GrayBlock>
            )}

            {/* Форма для авторизованных */}
            {status === 'authenticated' && (
                <FeedbackForm />
            )}

            {/* Список отзывов */}
            <div className="mt-8 space-y-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <GrayBlock key={i} className="p-6">
                            <Skeleton className="h-4 w-32 mb-3" />
                            <Skeleton className="h-20 w-full" />
                        </GrayBlock>
                    ))
                ) : feedbacks.length > 0 ? (
                    feedbacks.map(feedback => (
                        <FeedbackItem
                            key={feedback.id}
                            feedback={feedback}
                        />
                    ))
                ) : (
                    <GrayBlock className="text-center p-6">
                        Пока нет опубликованных отзывов
                    </GrayBlock>
                )}
            </div>
        </Container>
    );
}

function FeedbackForm() {
    const { data: session } = useSession();
    const form = useForm<FeedbackFormValues>({
        resolver: zodResolver(FeedbackFormSchema),
        defaultValues: { feedbackText: '' }
    });

    const handleSubmit = async (values: FeedbackFormValues) => {
        try {
            await createFeedback(values.feedbackText);

            toast.success(
                <div className="flex items-center">
                    <span>Ваш отзыв отправлен на проверку. После проверки он будет опубликован</span>
                </div>,
                { duration: 5000 }
            );

            form.reset();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Не удалось отправить отзыв');
            }
        }
    };


    return (
        <GrayBlock className="mb-8 p-6" title="Оставить отзыв">
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid gap-4">
                        <FormTextarea
                            name="feedbackText"
                            placeholder="Напишите ваш отзыв..."
                            className="min-h-[120px]"
                            label="Текст отзыва"
                            required
                        />

                        <div className="flex gap-4 items-center">
                            <p className="font-medium mb-2">Имя:</p>
                            <FormInput
                                name="userName"
                                value={session?.user.name}
                                disabled
                                className="w-full"
                            />
                            <Button
                                type="submit"
                                className="h-10 px-6"
                            >
                                Отправить
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </GrayBlock>
    );
}

function FeedbackItem({ feedback }: { feedback: FeedbackWithUser }) {
    return (
        <GrayBlock className="p-6">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{feedback.user.name}</h3>
                <span className="text-sm text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">
                {feedback.feedbackText}
            </p>
        </GrayBlock>
    );
}
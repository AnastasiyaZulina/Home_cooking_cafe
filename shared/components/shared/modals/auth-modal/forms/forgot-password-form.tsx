'use client';

import React from "react";
import { useForm, FormProvider } from "react-hook-form"; // Добавили FormProvider
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FormInput, Title } from "@/shared/components";
import toast from "react-hot-toast";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Некорректный email"),
});

type TForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

interface Props {
  onClose?: VoidFunction;
  onBack?: VoidFunction;
}

export const ForgotPasswordForm: React.FC<Props> = ({ onClose, onBack }) => {
  const formMethods = useForm<TForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: TForgotPasswordValues) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
  
      const responseData = await res.json();
  
      if (!res.ok || !responseData.success) {
        throw new Error(responseData.error || 'Ошибка запроса');
      }
  
      toast.success("Письмо с инструкциями отправлено на вашу почту");
      onClose?.();
    } catch (error) {
      toast.error("Произошла ошибка при отправке письма");
      console.error("Ошибка при отправке письма:", error);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div className="mr-2">
            <Title text="Восстановление пароля" size="md" className="font-bold" />
            <p className="text-gray-400">
              Введите email, указанный при регистрации
            </p>
          </div>
          <img 
            src="/assets/images/phone-icon.png" 
            alt="phone-icon" 
            width={60} 
            height={60} 
          />
        </div>

        <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput name="email" label="E-Mail" required />
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-12 flex-1"
            >
              Назад
            </Button>
            <Button
              type="submit"
              loading={formMethods.formState.isSubmitting}
              className="h-12 flex-1"
            >
              Отправить
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};
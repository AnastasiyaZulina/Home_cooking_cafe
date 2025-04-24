'use client';

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FormInput, Title } from "@/shared/components";
import toast from "react-hot-toast";
import { z } from "zod";
import { Api } from "@/shared/services/api-clients";

const forgotPasswordSchema = z.object({
  email: z.string().email('Введите корректную почту').max(100, 'Email не должен превышать 100 символов'),
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
      await Api.reset.requestPasswordReset(data.email);
      
      toast.success("Письмо с инструкциями отправлено на вашу почту");
      onClose?.();
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Произошла ошибка при отправке письма"
      );
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
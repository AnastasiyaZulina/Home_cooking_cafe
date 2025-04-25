"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button, FormInput } from "@/shared/components";
import { Api } from "@/shared/services/api-clients";
import { resetPasswordSchema, TResetPasswordValues } from "@/shared/schemas/reset-password";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const form = useForm<TResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: TResetPasswordValues) => {
    try {
      if (!token) {
        toast.error("Недействительная ссылка для сброса пароля");
        return;
      }
      
      await Api.reset.confirmPasswordReset(data.password, token);
      
      toast.success("Пароль успешно изменен!");
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      const errorMessage = error instanceof Error && error.message 
        ? error.message
        : "Ошибка при смене пароля. Проверьте срок действия ссылки.";
      
      toast.error(errorMessage);
      console.error("Password reset error:", error);
    }
  };

  return (
    <FormProvider {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Пароль должен содержать:
          <span className="block ml-2 mt-1">
            • 6+ символов
            <span className="mx-2">•</span>
            Заглавные и строчные буквы
            <span className="mx-2">•</span>
            Цифры
          </span>
        </p>
        <FormInput
          name="password"
          label="Новый пароль"
          type="password"
          required
        />
        <FormInput
          name="confirmPassword"
          label="Подтвердите пароль"
          type="password"
          required
        />
        <Button 
          type="submit"
          className="w-full h-12 text-base"
        >
          Сменить пароль
        </Button>
      </form>
    </FormProvider>
  );
}
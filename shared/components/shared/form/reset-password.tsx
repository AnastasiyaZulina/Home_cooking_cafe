"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button, FormInput } from "@/shared/components";
import { z } from "zod";

const resetPasswordSchema = z.object({
    password: z.string()
    .min(6, 'Пароль должен содержать не менее 6 символов')
    .max(100, 'Пароль не должен превышать 100 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
    .regex(/^[a-zA-Z0-9]+$/, 'Пароль должен содержать только латинские буквы и цифры'),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type TResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
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
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });

      if (!res.ok) throw new Error();

      toast.success("Пароль успешно изменен!");
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      toast.error("Ошибка при смене пароля. Проверьте срок действия ссылки.");
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
"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button, FormInput } from "@/shared/components";
import { z } from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
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
      console.error("Error resetting password:", error);
      toast.error("Ошибка при смене пароля. Проверьте срок действия ссылки.");
    }
  };

  return (
    <FormProvider {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
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
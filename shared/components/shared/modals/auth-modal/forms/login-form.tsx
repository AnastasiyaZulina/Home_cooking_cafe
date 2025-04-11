import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { formLoginSchema, TFormLoginValues } from "./schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FormInput, Title } from "@/shared/components";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { Api } from "@/shared/services/api-clients";
import { useCartStore } from "@/shared/store";

interface Props {
  onClose?: VoidFunction;
  onForgotPassword?: VoidFunction;
}

export const LoginForm: React.FC<Props> = ({ onClose,  onForgotPassword}) => {
  const { fetchCartItems } = useCartStore();

  const form = useForm<TFormLoginValues>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: TFormLoginValues) => {
    try {
      const resp = await signIn('credentials', {
        ...data,
        redirect: false,
      });

      if (!resp?.ok) {
        return toast.error('Неверный E-Mail или пароль', {
          icon: '❌',
        });
      }

      const cartToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('cartToken='))
        ?.split('=')[1];

      if (cartToken) {
        try {
          await Api.cart.mergeCarts({ cartToken });

          // Очищаем куки
          document.cookie = 'cartToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          console.log('Cart token cleared');
        } catch (mergeError) {
          console.error('Merge error:', mergeError);
          toast.error('Ошибка объединения корзин');
        }
      }

      await fetchCartItems();
      onClose?.();
    } catch (error) {
      console.log('Error [LOGIN]', error);
      toast.error('Не удалось войти', {
        icon: '❌',
      });
    }
  };


  return <FormProvider {...form}>
    <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex justify-between items-center">
        <div className="mr-2">
          <Title text="Вход в аккаунт" size="md" className="font-bold" />
          <p className="text-gray-400">Введите свою почту, чтобы войти в свой аккаунт</p>
        </div>
        <img src="/assets/images/phone-icon.png" alt="phone-icon" width={60} height={60} />
      </div>

      <FormInput name="email" label="E-Mail" required />
      <FormInput type="password" name="password" label="Пароль" required />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onForgotPassword?.()}
          className="text-sm text-blue-500 hover:underline"
        >
          Забыли пароль?
        </button>
      </div>
      <Button disabled={form.formState.isSubmitting} className="h-12 text-base" type="submit">
        Войти
      </Button>
    </form>
  </FormProvider>;
}
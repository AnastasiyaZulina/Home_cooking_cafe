'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '@prisma/client';
import { signOut } from 'next-auth/react';
import {
  formRegisterSchema,
  formUpdateGoogleUserSchema,
  formUpdateUserWithPasswordSchema,
  TFormRegisterValues,
  TFormUpdateGoogleValues,
  TFormUpdateUserWithPasswordValues
} from './modals/auth-modal/forms/schemas';
import { Container } from './container';
import { Title } from './title';
import { FormInput } from './form';
import { Button } from '../ui';
import { updateUserInfo } from '@/app/actions';
import { Gift, X } from 'lucide-react';
import PhoneInput from 'react-phone-number-input/react-hook-form-input';
import { cn } from '@/shared/lib/utils';
import { ErrorText } from './error-text';
import { z } from 'zod';

interface Props {
  data: User;
  label?: string;
  required?: boolean;
  className?: string;
}

export const ProfileForm: React.FC<Props> = ({ data }) => {
  const hasPassword = !!data.password;
  
  // Явно указываем тип resolver
  const resolver = hasPassword 
    ? zodResolver(formUpdateUserWithPasswordSchema)
    : zodResolver(formUpdateGoogleUserSchema);

  const form = useForm<
    TFormUpdateUserWithPasswordValues | TFormUpdateGoogleValues
  >({
    resolver: resolver as any, // Используем явное приведение типа
    defaultValues: {
      name: data.name,
      phone: data.phone || '',
    },
  });

  // Объединяем обработчик сабмита
  const onSubmit = async (formData: any) => {
    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone || null,
      };

      // Для пользователей с паролем
      if (hasPassword) {
        if (formData.newPassword) {
          updateData.password = formData.newPassword;
          updateData.currentPassword = formData.currentPassword;
        }
      }
      // Для OAuth пользователей без пароля
      else if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      await updateUserInfo(updateData);
      toast.success('Данные обновлены 📝', { icon: '✅' });

      if (formData.newPassword) {
        form.reset({
          ...form.getValues(),
          newPassword: '',
          confirmPassword: '',
          ...(hasPassword && { currentPassword: '' })
        });
      }
    } catch (error) {
      toast.error('Ошибка при обновлении данных', { icon: '❌' });
    }
  };

  return (
    <Container className="px-4">
      <Title text="Личные данные" size="md" className="font-bold text-center mb-2" />

      <div className="bg-gray-100 rounded-lg shadow-sm p-4 mb-6 max-w-[384px] mx-auto">
        <div className="flex items-center">
          <Gift className="w-5 h-5 text-primary" />
          <span className="text-gray-600 font-bold">Ваши бонусы:</span>
          <span className="text-lg font-bold text-primary ml-2">{data.bonusBalance || 0} ₽</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Бонусы можно использовать при следующих покупках
        </p>
      </div>

      <FormProvider {...form}>
        <form
          className="flex flex-col gap-4 w-full max-w-[384px] mx-auto"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormInput
            name="email"
            label="E-Mail"
            value={data.email}
            readOnly
            className="cursor-not-allowed"
            disabled
            required={false}
          />

          <FormInput name="name" label="Имя" required />

          <div className="relative">
            <p className="font-medium mb-2">
              Номер телефона
            </p>
            <div className="relative">
              <PhoneInput
                name="phone"
                country="RU"
                international
                withCountryCallingCode
                placeholder="+7 (999) 123-45-67"
                rules={{
                  validate: (value: string) =>
                    !value ||
                    (value.startsWith('+7') && value.length === 12) ||
                    "Введите корректный российский номер (+7XXXXXXXXXX)"
                }}
                className={cn(
                  "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-md pr-10",
                  form.formState.errors.phone && "border-destructive"
                )}
              />
              {form.watch('phone') && (
                <button
                  onClick={() => form.setValue('phone', '', { shouldValidate: true })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              )}
              {form.formState.errors.phone?.message && (
                <ErrorText text={form.formState.errors.phone.message as string} />
              )}
            </div>
          </div>

          {hasPassword && (
            <FormInput
              type="password"
              name="currentPassword"
              label="Текущий пароль"
              required={true} // Делаем обязательным
            />
          )}

          <div className={cn(!hasPassword)}>
            <FormInput
              type="password"
              name="newPassword"
              label={hasPassword ? "Новый пароль" : "Установить пароль"}
              required={!hasPassword} // Обязателен для OAuth
            />
          </div>
          <div className={cn(!hasPassword)}>
            <FormInput
              type="password"
              name="confirmPassword"
              label="Подтвердите пароль"
              required={!hasPassword} // Обязателен для OAuth
            />
          </div>
          <Button
            disabled={form.formState.isSubmitting}
            className="text-base mt-6 md:mt-6 w-full"
            type="submit"
          >
            {form.formState.isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>

          <Button
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="secondary"
            className="text-base w-full"
            type="button"
          >
            Выйти
          </Button>
        </form>
      </FormProvider>
    </Container>
  );
};
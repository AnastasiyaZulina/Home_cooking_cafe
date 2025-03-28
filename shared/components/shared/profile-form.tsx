'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '@prisma/client';
import { signOut } from 'next-auth/react';
import { formRegisterSchema, TFormRegisterValues } from './modals/auth-modal/forms/schemas';
import { Container } from './container';
import { Title } from './title';
import { FormInput } from './form';
import { Button } from '../ui';
import { updateUserInfo } from '@/app/actions';
import { Gift } from 'lucide-react';

interface Props {
  data: User;
}

export const ProfileForm: React.FC<Props> = ({ data }) => {
  const form = useForm({
    resolver: zodResolver(formRegisterSchema),
    defaultValues: {
      fullName: data.fullName,
      email: data.email,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (formData: TFormRegisterValues) => {
    try {
      await updateUserInfo({
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
      });

      toast.success('Данные обновлены 📝', {
        icon: '✅',
      });

      // Сбрасываем поля паролей после успешного обновления
      form.reset({
        ...form.getValues(),
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Ошибка при обновлении данных', {
        icon: '❌',
      });
    }
  };

  const onClickSignOut = () => {
    signOut({
      callbackUrl: '/',
    });
  };

  return (
    <Container className="my-6 md:my-10 px-4">
      <Title text="Личные данные" size="md" className="font-bold text-center mb-2" />

      {/* Блок с информацией о бонусах */}
      <div className="bg-gray-100 rounded-lg shadow-sm p-4 mb-6 max-w-[384px] mx-auto">
        <div className="flex items-center">
          <Gift className="w-5 h-5 text-primary" />&nbsp;
          <span className="text-gray-600 font-bold">Ваши бонусы:</span>&nbsp;&nbsp;<span className="text-lg font-bold text-primary">{data.bonusBalance || 0} ₽</span>
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
          <FormInput name="email" label="E-Mail" required />
          <FormInput name="fullName" label="Полное имя" required />

          <FormInput
            type="password"
            name="password"
            label="Новый пароль"
            required
          />
          <FormInput
            type="password"
            name="confirmPassword"
            label="Повторите пароль"
            required
          />

          <Button
            disabled={form.formState.isSubmitting}
            className="text-base mt-6 md:mt-6 w-full"
            type="submit"
          >
            {form.formState.isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>

          <Button
            onClick={onClickSignOut}
            variant="secondary"
            disabled={form.formState.isSubmitting}
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
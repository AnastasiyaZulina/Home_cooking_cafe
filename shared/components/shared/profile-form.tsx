'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '@prisma/client';
import { signOut } from 'next-auth/react';
import { formRegisterSchema, TFormRegisterValues, } from './modals/auth-modal/forms/schemas';
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
  const isOAuthUser = !!data.provider;
  const form = useForm({
    resolver: zodResolver(formRegisterSchema),
    defaultValues: {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (formData: TFormRegisterValues) => {
    try {
      await updateUserInfo({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
      });

      toast.success('Данные обновлены 📝', { icon: '✅' });
      
      form.reset({
        ...form.getValues(),
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Ошибка при обновлении данных', { icon: '❌' });
    }
  };

  return (
    <Container className="my-6 md:my-10 px-4">
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
            readOnly 
            className="cursor-not-allowed"
          />
          
          <FormInput name="name" label="Имя" required />
          
          <FormInput 
            name="phone" 
            label="Номер телефона" 
            placeholder="+7 (999) 999-99-99" 
          />

          {!isOAuthUser && (
            <>
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
            </>
          )}

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
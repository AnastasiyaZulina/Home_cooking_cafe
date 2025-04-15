import ResetPasswordForm from '@/shared/components/shared/form/reset-password';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto p-4 mt-10">
      <h1 className="text-2xl font-bold mb-6">Сброс пароля</h1>
      <Suspense fallback={<div>Загрузка...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
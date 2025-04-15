'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export const VerifyToastHandler = () => {
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');

  useEffect(() => {
    if (verified === 'success') {
      toast.success('Email успешно подтверждён!');
    } else if (verified === 'error') {
      toast.error('Ошибка подтверждения email');
    }
  }, [verified]);

  return null;
};

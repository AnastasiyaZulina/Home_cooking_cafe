'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../ui';
import { ErrorText, RequiredSymbol } from '../service-components';
import { ClearButton } from '../buttons';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export const PhoneInput: React.FC<Props> = ({ className, name, label, required, ...props }) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const errorText = errors?.[name]?.message as string;
  const value = watch(name) || '+7 '; // Предзаполнение +7

  const formatPhoneNumber = (input: string) => {
    let digits = input.replace(/\D/g, ''); // Убираем все нецифровые символы

    if (!digits.startsWith('7')) {
        digits = '7' + digits;
    }

    return `+${digits.slice(0, 11)}`; // Формат +7XXXXXXXXXX
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue(name, formatted, { shouldValidate: true });
  };

  const onClickClear = () => {
    setValue(name, '+7 ', { shouldValidate: true });
  };

  return (
    <div className={className}>
      {label && (
        <p className="font-medium mb-2">
          {label} {required && <RequiredSymbol />}
        </p>
      )}

      <div className="relative">
        <Input
          className="h-12 text-md"
          {...register(name)}
          {...props}
          value={value}
          onChange={handleChange}
        />
        {value !== '+7 ' && <ClearButton onClick={onClickClear} />}
      </div>

      {errorText && <ErrorText text={errorText} />}
    </div>
  );
};

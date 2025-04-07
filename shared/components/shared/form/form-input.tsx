'use client';

import React from 'react';
import { Input } from '../../ui';
import { RequiredSymbol } from '../required-symbol';
import { ErrorText } from '../error-text';
import { useFormContext } from 'react-hook-form';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export const FormInput: React.FC<Props> = ({ className, name, label, required, ...props }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorText = errors?.[name]?.message as string;

  // Функция для преобразования значений в число
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.type === 'number') {
      return e.target.valueAsNumber || '';
    }
    return e.target.value;
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
          {...register(name, {
            setValueAs: props.type === 'number' 
              ? (v) => (v === '' ? undefined : Number(v)) 
              : undefined,
            onChange: handleNumberInput
          })}
          {...props}
          step={props.type === 'number' ? 'any' : undefined}
        />
      </div>

      {errorText && <ErrorText text={errorText} />}
    </div>
  );
};
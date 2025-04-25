'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ErrorText, RequiredSymbol } from '../service-components';
import { Input } from '../ui';

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
          min={props.min}
          max={props.max}
          {...props}
          step={props.type === 'number' ? 'any' : undefined}
        />
      </div>

      {errorText && <ErrorText text={errorText} />}
    </div>
  );
};
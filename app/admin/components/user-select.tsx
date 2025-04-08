'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useFormContext } from 'react-hook-form';

type User = {
  id?: number;
  name: string;
  email: string;
};

export const UserSelect = ({ 
  users,
  onUserSelect,
  disabled
}: { 
  users: User[];
  onUserSelect: (userId: number | undefined) => void;
  disabled?: boolean;
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name="userId"
      control={control}
      render={({ field }) => (
        <Select
          value={field.value !== undefined ? String(field.value) : "unselected"}
          onValueChange={(value) => {
            if (disabled) return;
            const userId = value !== "unselected" ? parseInt(value) : undefined;
            field.onChange(userId);
            onUserSelect(userId || undefined);
          }}
        >
          <SelectTrigger className="w-full" disabled={disabled}>
            <SelectValue placeholder="Выберите клиента" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unselected">Не выбрано</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={String(user.id)}>
                #{user.id} - {user.name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
};
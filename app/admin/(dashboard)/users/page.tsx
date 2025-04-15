'use client'

import { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MRT_Row,
} from 'material-react-table';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';
import { Edit, Delete, Add, LockReset } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { useSession } from 'next-auth/react';
import { type MRT_ColumnFiltersState } from 'material-react-table';

dayjs.extend(updateLocale);
dayjs.locale('ru');
dayjs.updateLocale('ru', {
  formats: {
    time: 'HH:mm',
    timePicker: 'HH:mm',
  },
});

type User = {
  id: number;
  name: string;
  email: string;
  bonusBalance: number;
  phone?: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  provider?: string;
  providerId?: string;
  verified?: Date;
  createdAt: Date;
  updatedAt: Date;
};

type UserFormValues = {
  name: string;
  email: string;
  bonusBalance: number;
  phone?: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  isVerified: boolean;
};

type DateRange = {
  from?: string;
  to?: string;
};

const UserTable = () => {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([]);
  const { data: session } = useSession();

  // Fetch users data with filters
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users', columnFilters],
    queryFn: async () => {
      const params = new URLSearchParams();

      columnFilters.forEach(filter => {
        if (filter.id === 'createdAt' || filter.id === 'updatedAt') {
          const value = filter.value as DateRange;

          if (value?.from) params.append(`${filter.id}[gte]`, value.from);
          if (value?.to) params.append(`${filter.id}[lte]`, value.to);
        } else {
          params.append(filter.id, String(filter.value));
        }
      });

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const filteredUsers = useMemo(() => {
    if (session?.user.role === 'SUPERADMIN') {
      return users?.filter(u => u.id !== session.user.id);
    }
    return users;
  }, [users, session]);

  // Form states
  const [createFormValues, setCreateFormValues] = useState<UserFormValues>({
    name: '',
    email: '',
    bonusBalance: 0,
    phone: '+7',
    role: 'USER',
    isVerified: false,
  });

  const [editFormValues, setEditFormValues] = useState<UserFormValues>({
    name: '',
    email: '',
    bonusBalance: 0,
    phone: '+7',
    role: 'USER',
    isVerified: false,
  });

  // Mutations
  const { mutateAsync: deleteUser } = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Пользователь успешно удален');
    },
  });

  const { mutateAsync: createUser } = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          phone: data.phone && data.phone !== '+7' ? data.phone.trim() : null,
          verified: data.isVerified ? new Date() : null
        }),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Пользователь успешно создан');
    },
  });

  const { mutateAsync: updateUser } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<UserFormValues> }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          phone: data.phone && data.phone !== '+7' ? data.phone.trim() : null,
          verified: data.isVerified ? new Date() : null
        }),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Пользователь успешно обновлен');
    },
  });

  const { mutateAsync: resetPassword } = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Ошибка при сбросе пароля');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Ссылка для сброса пароля отправлена на почту пользователя');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ошибка при сбросе пароля');
    },
  });

  // Handlers
  const handleDeleteUser = async (row: MRT_Row<User>) => {
    if (window.confirm(`Вы уверены, что хотите удалить пользователя "${row.original.name}"?`)) {
      try {
        await deleteUser(row.original.id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleResetPassword = async (row: MRT_Row<User>) => {
    if (window.confirm(`Сбросить пароль для пользователя "${row.original.name}"?`)) {
      try {
        await resetPassword(row.original.email);
      } catch (error) {
        console.error('Password reset error:', error);
      }
    }
  };

  const handleEditRow = (user: User) => {
    setEditFormValues({
      ...user,
      phone: user.phone || '+7', // Показываем +7 если номер отсутствует
      isVerified: !!user.verified,
    });
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const validatePhone = (phone?: string | null) => {
    if (!phone || phone === '+7') return true; // Разрешаем пустое значение и +7
    return /^\+7\d{10}$/.test(phone);
  };

  const validateForm = (values: UserFormValues) => {
    const errors: Partial<Record<keyof UserFormValues, string>> = {};
    if (!values.name.trim()) errors.name = 'Обязательное поле';
    
    // Новое регулярное выражение для email
    if (!values.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      errors.email = 'Некорректный email';
    }
    
    if (values.bonusBalance < 0) errors.bonusBalance = 'Не может быть отрицательным';
    if (values.phone && !validatePhone(values.phone)) {
      errors.phone = 'Формат: +7XXXXXXXXXX';
    }
    
    if (session?.user.role === 'ADMIN' && values.role === 'ADMIN') {
      errors.role = 'Недостаточно прав для назначения этой роли';
    }
  
    return errors;
  };

  const handlePhoneChange = (value: string, isCreate: boolean) => {
    let formattedValue = value.replace(/[^0-9+]/g, '');

    // Если ввод начинается не с +7, добавляем автоматически
    if (!formattedValue.startsWith('+7') && formattedValue.length > 0) {
      formattedValue = '+7' + formattedValue.replace(/^\+/, '');
    }

    // Ограничиваем длину
    formattedValue = formattedValue.slice(0, 12);

    // Сохраняем значение
    if (isCreate) {
      setCreateFormValues(prev => ({
        ...prev,
        phone: formattedValue || undefined
      }));
    } else {
      setEditFormValues(prev => ({
        ...prev,
        phone: formattedValue || undefined
      }));
    }
  };

  // Table columns
  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', size: 80, filterVariant: 'range' },
      { accessorKey: 'name', header: 'Имя' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'bonusBalance',
        header: 'Бонусы',
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
        filterVariant: 'range',
      },
      { accessorKey: 'phone', header: 'Телефон' },
      {
        accessorKey: 'role',
        header: 'Роль',
        filterVariant: 'select',
        filterSelectOptions: session?.user.role === 'ADMIN'
          ? ['USER']
          : ['USER', 'ADMIN'],
      },
      {
        accessorKey: 'verified',
        header: 'Дата верификации',
        Cell: ({ cell }) => cell.getValue<Date>()
          ? dayjs(cell.getValue<Date>()).format('DD.MM.YYYY HH:mm')
          : 'Не подтвержден',
        filterVariant: 'datetime-range',
        muiFilterDateTimePickerProps: { ampm: false, format: 'DD.MM.YYYY HH:mm' },
      },
      { accessorKey: 'provider', header: 'Провайдер' },
      { accessorKey: 'providerId', header: 'ID провайдера' },
      {
        accessorFn: (row) => dayjs(row.createdAt).toDate(),
        accessorKey: 'createdAt',
        header: 'Дата создания',
        filterVariant: 'datetime-range',
        Cell: ({ cell }) => dayjs(cell.getValue<Date>()).format('DD.MM.YYYY HH:mm'),
        muiFilterDateTimePickerProps: { ampm: false, format: 'DD.MM.YYYY HH:mm' },
      },
      {
        accessorFn: (row) => dayjs(row.updatedAt).toDate(),
        accessorKey: 'updatedAt',
        header: 'Дата обновления',
        filterVariant: 'datetime-range',
        Cell: ({ cell }) => dayjs(cell.getValue<Date>()).format('DD.MM.YYYY HH:mm'),
        muiFilterDateTimePickerProps: { ampm: false, format: 'DD.MM.YYYY HH:mm' },
      },
    ],
    [session?.user.role]
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredUsers || [],
    state: { isLoading, columnFilters },
    onColumnFiltersChange: setColumnFilters,
    enableEditing: true,
    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setCreateDialogOpen(true)}
      >
        Создать пользователя
      </Button>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Tooltip title="Редактировать">
          <IconButton onClick={() => handleEditRow(row.original)}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Сбросить пароль">
          <IconButton
            color="warning"
            onClick={() => handleResetPassword(row)}
          >
            <LockReset />
          </IconButton>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton color="error" onClick={() => handleDeleteUser(row)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <MaterialReactTable table={table} />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Создать пользователя</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Имя"
            required
            value={createFormValues.name}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, name: e.target.value }))}
            error={!!validateForm(createFormValues).name}
            helperText={validateForm(createFormValues).name}
          />
          <TextField
            label="Email"
            required
            type="email"
            value={createFormValues.email}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, email: e.target.value }))}
            error={!!validateForm(createFormValues).email}
            helperText={validateForm(createFormValues).email}
          />
          <TextField
            label="Телефон"
            value={createFormValues.phone || ''}
            onChange={(e) => handlePhoneChange(e.target.value, true)}
            inputProps={{
              maxLength: 12,
              placeholder: '+7' // Добавляем плейсхолдер
            }}
            error={!!validateForm(createFormValues).phone}
            helperText={validateForm(createFormValues).phone || 'Необязательное поле. Формат: +7XXXXXXXXXX'}
          />
          <TextField
            label="Бонусный баланс"
            type="number"
            value={createFormValues.bonusBalance}
            onChange={(e) => setCreateFormValues(prev => ({
              ...prev,
              bonusBalance: Number(e.target.value),
            }))}
            error={!!validateForm(createFormValues).bonusBalance}
            helperText={validateForm(createFormValues).bonusBalance}
          />
          <TextField
            select
            label="Роль"
            value={createFormValues.role}
            onChange={(e) => setCreateFormValues(prev => ({
              ...prev,
              role: e.target.value as 'USER' | 'ADMIN',
            }))}
          >
            <MenuItem value="USER">Пользователь</MenuItem>
            {session?.user.role === 'SUPERADMIN' && (
              <MenuItem value="ADMIN">Администратор</MenuItem>
            )}
          </TextField>
          <FormControlLabel
            control={
              <Checkbox
                checked={createFormValues.isVerified}
                onChange={(e) => setCreateFormValues(prev => ({
                  ...prev,
                  isVerified: e.target.checked,
                }))}
              />
            }
            label="Почта подтверждена"
          />
          <FormHelperText>
            {createFormValues.isVerified
              ? 'Аккаунт будет подтвержден сразу'
              : 'Пользователь получит письмо для подтверждения'}
          </FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={() => createUser(createFormValues).then(() => setCreateDialogOpen(false))}
            disabled={Object.keys(validateForm(createFormValues)).length > 0}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Редактировать пользователя</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Имя"
            required
            value={editFormValues.name}
            onChange={(e) => setEditFormValues(prev => ({ ...prev, name: e.target.value }))}
            error={!!validateForm(editFormValues).name}
            helperText={validateForm(editFormValues).name}
          />
          <TextField
            label="Email"
            required
            type="email"
            value={editFormValues.email}
            onChange={(e) => setEditFormValues(prev => ({ ...prev, email: e.target.value }))}
            error={!!validateForm(editFormValues).email}
            helperText={validateForm(editFormValues).email}
          />
          <TextField
            label="Телефон"
            value={editFormValues.phone || ''}
            onChange={(e) => handlePhoneChange(e.target.value, true)}
            inputProps={{
              maxLength: 12,
              placeholder: '+7' // Добавляем плейсхолдер
            }}
            error={!!validateForm(editFormValues).phone}
            helperText={validateForm(editFormValues).phone || 'Необязательное поле. Формат: +7XXXXXXXXXX'}
          />
          <TextField
            label="Бонусный баланс"
            type="number"
            value={editFormValues.bonusBalance}
            onChange={(e) => setEditFormValues(prev => ({
              ...prev,
              bonusBalance: Number(e.target.value),
            }))}
            error={!!validateForm(editFormValues).bonusBalance}
            helperText={validateForm(editFormValues).bonusBalance}
          />
          <TextField
            select
            label="Роль"
            value={editFormValues.role}
            onChange={(e) => setEditFormValues(prev => ({
              ...prev,
              role: e.target.value as 'USER' | 'ADMIN',
            }))}
          >
            <MenuItem value="USER">Пользователь</MenuItem>
            {session?.user.role === 'SUPERADMIN' && (
              <MenuItem value="ADMIN">Администратор</MenuItem>
            )}
          </TextField>
          <FormControlLabel
            control={
              <Checkbox
                checked={editFormValues.isVerified}
                onChange={(e) => setEditFormValues(prev => ({
                  ...prev,
                  isVerified: e.target.checked,
                }))}
                disabled={!!selectedUser?.verified}
              />
            }
            label="Почта подтверждена"
          />
          <FormHelperText>
            {selectedUser?.verified
              ? 'Аккаунт уже подтвержден'
              : 'Изменение этого статуса подтвердит аккаунт'}
          </FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={() => updateUser({ id: selectedUser!.id, data: editFormValues })
              .then(() => setEditDialogOpen(false))}
            disabled={Object.keys(validateForm(editFormValues)).length > 0}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default UserTable;
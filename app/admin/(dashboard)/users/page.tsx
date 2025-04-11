'use client'

import { useEffect, useMemo, useState } from 'react';
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
import { Edit, Delete, Add } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

type User = {
  id: number;
  name: string;
  email: string;
  password?: string;
  bonusBalance: number;
  phone?: string;
  role: 'USER' | 'ADMIN';
  provider?: string;
  providerId?: string;
  verificationCode?: {
    code: string;
  };
  verified?: Date;
  createdAt: Date;
  updatedAt: Date;
};

type UserFormValues = {
    name: string;
    email: string;
    password?: string;
    bonusBalance: number;
    phone?: string;
    role: 'USER' | 'ADMIN';
    isVerified: boolean; // Флаг для управления в форме
  };

const UserTable = () => {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form states
  const [createFormValues, setCreateFormValues] = useState<Omit<UserFormValues, 'isVerified'>>({
    name: '',
    email: '',
    password: '',
    bonusBalance: 0,
    phone: '',
    role: 'USER',
  });

  const [editFormValues, setEditFormValues] = useState<UserFormValues>({
    name: '',
    email: '',
    bonusBalance: 0,
    phone: '',
    role: 'USER',
    isVerified: false,
  });

  // Fetch users data
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
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
    mutationFn: async (data: Omit<UserFormValues, 'isVerified'>) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Пользователь успешно обновлен');
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

  const handleEditRow = (user: User) => {
    setEditFormValues({
      name: user.name,
      email: user.email,
      bonusBalance: user.bonusBalance,
      phone: user.phone || '',
      role: user.role,
      isVerified: !!user.verified,
    });
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
  
    try {
      const updateData: Partial<{
        name: string;
        email: string;
        bonusBalance: number;
        phone?: string;
        role: 'USER' | 'ADMIN';
        password?: string;
        verified?: Date | null;
      }> = {
        name: editFormValues.name,
        email: editFormValues.email,
        bonusBalance: editFormValues.bonusBalance,
        phone: editFormValues.phone,
        role: editFormValues.role,
      };
  
      if (editFormValues.password) {
        updateData.password = editFormValues.password;
      }
  
      // Проверяем изменился ли статус верификации
      const wasVerified = !!selectedUser.verified;
      if (editFormValues.isVerified !== wasVerified) {
        updateData.verified = editFormValues.isVerified ? new Date() : null;
      }
  
      await updateUser({
        id: selectedUser.id,
        data: updateData,
      });
  
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser(createFormValues);
      setCreateDialogOpen(false);
      setCreateFormValues({
        name: '',
        email: '',
        password: '',
        bonusBalance: 0,
        phone: '',
        role: 'USER',
      });
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  const validateForm = (values: UserFormValues) => {
    const errors: Partial<Record<keyof UserFormValues, string>> = {};

    if (!values.name.trim()) errors.name = 'Обязательное поле';
    if (!values.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Некорректный email';
    if (values.bonusBalance < 0) errors.bonusBalance = 'Не может быть отрицательным';

    return errors;
  };

  const createErrors = validateForm({ ...createFormValues, isVerified: false });
  const editErrors = validateForm(editFormValues);

  // Table columns
  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', size: 80 },
      { accessorKey: 'name', header: 'Имя' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'password',
        header: 'Пароль',
        Cell: ({ cell }) => cell.getValue() ? '••••••' : 'N/A',
      },
      {
        accessorKey: 'bonusBalance',
        header: 'Бонусы',
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      { accessorKey: 'phone', header: 'Телефон' },
      {
        accessorKey: 'role',
        header: 'Роль',
        filterVariant: 'select',
        filterSelectOptions: ['USER', 'ADMIN'],
      },
      { accessorKey: 'provider', header: 'Провайдер' },
      { accessorKey: 'providerId', header: 'ID провайдера' },
      {
        accessorKey: 'verificationCode.code',
        header: 'Код верификации',
        Cell: ({ row }) => row.original.verificationCode?.code || 'N/A',
      },
      {
        accessorKey: 'verified',
        header: 'Дата верификации',
        Cell: ({ cell }) => cell.getValue<Date>() 
          ? dayjs(cell.getValue<Date>()).format('DD.MM.YYYY HH:mm')
          : 'N/A',
      },
      {
        accessorKey: 'createdAt',
        header: 'Дата создания',
        Cell: ({ cell }) => dayjs(cell.getValue<Date>()).format('DD.MM.YYYY HH:mm'),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Дата обновления',
        Cell: ({ cell }) => dayjs(cell.getValue<Date>()).format('DD.MM.YYYY HH:mm'),
      },
    ],
    []
  );

  // Table instance
  const table = useMaterialReactTable({
    columns,
    data: users || [],
    getRowId: (row) => row.id?.toString() ?? '',
    state: { isLoading },
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
        <Tooltip title="Удалить">
          <IconButton color="error" onClick={() => handleDeleteUser(row)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MaterialReactTable table={table} />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Создать нового пользователя</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Имя"
            required
            value={createFormValues.name}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, name: e.target.value }))}
            error={!!createErrors.name}
            helperText={createErrors.name}
          />
          <TextField
            label="Email"
            required
            type="email"
            value={createFormValues.email}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, email: e.target.value }))}
            error={!!createErrors.email}
            helperText={createErrors.email}
          />
          <TextField
            label="Пароль"
            type="password"
            value={createFormValues.password}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, password: e.target.value }))}
          />
          <TextField
            label="Телефон"
            value={createFormValues.phone}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, phone: e.target.value }))}
          />
          <TextField
            label="Бонусный баланс"
            type="number"
            value={createFormValues.bonusBalance}
            onChange={(e) => setCreateFormValues(prev => ({
              ...prev,
              bonusBalance: Number(e.target.value),
            }))}
            error={!!createErrors.bonusBalance}
            helperText={createErrors.bonusBalance}
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
            <MenuItem value="ADMIN">Администратор</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={Object.keys(createErrors).length > 0}
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
            error={!!editErrors.name}
            helperText={editErrors.name}
          />
          <TextField
            label="Email"
            required
            type="email"
            value={editFormValues.email}
            onChange={(e) => setEditFormValues(prev => ({ ...prev, email: e.target.value }))}
            error={!!editErrors.email}
            helperText={editErrors.email}
          />
          <TextField
            label="Новый пароль"
            type="password"
            value={editFormValues.password || ''}
            onChange={(e) => setEditFormValues(prev => ({ ...prev, password: e.target.value }))}
          />
          <TextField
            label="Телефон"
            value={editFormValues.phone}
            onChange={(e) => setEditFormValues(prev => ({ ...prev, phone: e.target.value }))}
          />
          <TextField
            label="Бонусный баланс"
            type="number"
            value={editFormValues.bonusBalance}
            onChange={(e) => setEditFormValues(prev => ({
              ...prev,
              bonusBalance: Number(e.target.value),
            }))}
            error={!!editErrors.bonusBalance}
            helperText={editErrors.bonusBalance}
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
            <MenuItem value="ADMIN">Администратор</MenuItem>
          </TextField>
          <FormControlLabel
            control={
              <Checkbox
                checked={editFormValues.isVerified}
                onChange={(e) => setEditFormValues(prev => ({
                  ...prev,
                  isVerified: e.target.checked,
                }))}
              />
            }
            label="Подтвержденный аккаунт"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={Object.keys(editErrors).length > 0}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default UserTable;
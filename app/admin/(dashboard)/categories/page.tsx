'use client';
import { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MRT_Row,
  MRT_TableOptions,
} from 'material-react-table';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

type Category = {
  id: number;
  name: string;
};

const CategoryTable = () => {
  const queryClient = useQueryClient();
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Получение данных
  const { data, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/admin/categories');
      return response.json();
    },
  });

  // Мутация для обновления
  const { mutateAsync: updateCategory } = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при обновлении категории');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const { mutateAsync: createCategory } = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при создании категории');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const { mutateAsync: deleteCategory } = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при удалении категории');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Произошла ошибка при удалении');
    },
  });

  const handleDeleteCategory = async (row: MRT_Row<Category>) => {
    if (window.confirm(`Вы уверены, что хотите удалить категорию "${row.original.name}"? Будут удалены все товары в этой категории!`)) {
      try {
        await toast.promise(
          deleteCategory(row.original.id),
          {
            loading: 'Удаление категории...',
            success: 'Категория успешно удалена!',
            error: (err) => err.message || 'Ошибка при удалении',
          }
        );
      } catch (error) {
        console.error('[ERROR]:', error);
        throw error;
      }
    }
  };

  const handleCreateCategory: MRT_TableOptions<Category>['onCreatingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateCategory(values);
    if (Object.values(newValidationErrors).some(Boolean)) {
      setValidationErrors(newValidationErrors);
      toast.error('Пожалуйста, исправьте ошибки');
      return;
    }
    setValidationErrors({});
    
    try {
      await toast.promise(
        createCategory(values.name),
        {
          loading: 'Создание категории...',
          success: 'Категория успешно создана!',
          error: (err) => err.message || 'Ошибка при создании',
        }
      );
      table.setCreatingRow(null); // Закрываем режим создания
    } catch (error) {
      console.error('[ERROR]:', error);
      throw error;
    }
  };

  // Валидация
  const validateCategory = (category: Category) => {
    return {
      name: !category.name ? 'Название обязательно' : '',
    };
  };

  // Обработчик сохранения
  const handleSaveCategory = async ({ row, values }: { row: MRT_Row<Category>; values: Category }) => {
    const newValidationErrors = validateCategory(values);
    if (Object.values(newValidationErrors).some(Boolean)) {
      setValidationErrors(newValidationErrors);
      toast.error('Пожалуйста, исправьте ошибки');
      return;
    }
    setValidationErrors({});
    
    try {
      await toast.promise(
        updateCategory({ id: row.original.id, name: values.name }),
        {
          loading: 'Обновление категории...',
          success: 'Категория успешно обновлена!',
          error: (err) => err.message || 'Ошибка при обновлении',
        }
      );
    } catch (error) {
      console.error('[ERROR]:', error);
      throw error;
    }
  };

  const columns = useMemo<MRT_ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
        enableEditing: false,
      },
      {
        accessorKey: 'name',
        header: 'Название',
        size: 200,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors.name,
          helperText: validationErrors.name,
          onFocus: () => setValidationErrors({ ...validationErrors, name: undefined }),
        },
      },
      {
        accessorKey: 'isAvailable',
        header: 'Видимость',
        size: 120,
        // Отображаем "Да/Нет" вместо true/false
        Cell: ({ cell }) => cell.getValue<boolean>() ? 'Да' : 'Нет',
        // Режим редактирования
        editVariant: 'select',
        editSelectOptions: [
          { value: true, label: 'Да' },
          { value: false, label: 'Нет' }
        ],
        muiEditTextFieldProps: {
          select: true,
        },
      },
    ],
    [validationErrors]
  );

  const table = useMaterialReactTable({
    columns,
    data: data || [],
    state: { isLoading },
    enableEditing: true,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    onCreatingRowSave: handleCreateCategory,
    onCreatingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveCategory,
    onEditingRowCancel: () => setValidationErrors({}),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => table.setCreatingRow(true)}
        sx={{ mr: 2 }}
      >
        Создать категорию
      </Button>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Tooltip title="Редактировать">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton 
            color="error" 
            onClick={() => handleDeleteCategory(row)}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <>
      <MaterialReactTable table={table} />
    </>
  );
};

export default CategoryTable;
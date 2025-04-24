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
import { Api } from '@/shared/services/api-clients';
import { Category } from '@prisma/client';

const CategoryTable = () => {
  const queryClient = useQueryClient();
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

   // Получение данных через сервис
   const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: Api.categories.getCategories,
  });
  

  // Мутация для обновления
  const { mutateAsync: updateCategory } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) => 
      Api.categories.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория успешно обновлена');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ошибка при обновлении категории');
    },
  });

  // Мутация для создания
  const { mutateAsync: createCategory } = useMutation({
    mutationFn: (data: { name: string; isAvailable: boolean }) => 
      Api.categories.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория успешно создана');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ошибка при создании категории');
    },
  });

  // Мутация для удаления
  const { mutateAsync: deleteCategory } = useMutation({
    mutationFn: (id: number) => Api.categories.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория успешно удалена');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ошибка при удалении категории');
    },
  });


  const handleDeleteCategory = async (row: MRT_Row<Category>) => {
    if (window.confirm(`Вы уверены, что хотите удалить категорию "${row.original.name}"? Будут удалены все товары в этой категории!`)) {
      try {
        await 
          deleteCategory(row.original.id);
      } catch (error) {
        console.error('[ERROR]:', error);
        throw error;
      }
    }
  };

  const handleCreateCategory: MRT_TableOptions<Category>['onCreatingRowSave'] = async ({ values }) => {
    const newValidationErrors = validateCategory(values);
    if (Object.values(newValidationErrors).some(Boolean)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    try {
      await createCategory({
        name: values.name,
        isAvailable: values.isAvailable
      });
    } catch (error) {
      console.error('[ERROR]:', error);
    }
  };

  // Валидация
  const validateCategory = (category: Category) => {
    const errors: Record<string, string | undefined> = {};
    
    if (!category.name) {
      errors.name = 'Название обязательно';
    } else if (category.name.length > 50) {
      errors.name = 'Название не должно превышать 50 символов';
    }
    
    return errors;
  };

  // Обработчик сохранения
  const handleSaveCategory = async ({ row, values }: { row: MRT_Row<Category>; values: Category }) => {
    const newValidationErrors = validateCategory(values);
    if (Object.values(newValidationErrors).some(Boolean)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    try {
      await updateCategory({
        id: row.original.id,
        data: {
          name: values.name,
          isAvailable: values.isAvailable
        }
      });
    } catch (error) {
      console.error('[ERROR]:', error);
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
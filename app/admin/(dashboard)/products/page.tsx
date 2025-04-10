'use client'

import React, { useMemo, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Delete, Visibility, Add } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

type Product = {
  id: number;
  name: string;
  image: string;
  description?: string;
  price: number;
  weight: number;
  eValue: number;
  isAvailable: boolean;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
  };
};

const ProductTable = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { data, isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/admin/products');
      return response.json();
    },
  });

  const { mutateAsync: deleteProduct } = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении товара');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleDeleteProduct = async (row: MRT_Row<Product>) => {
    if (window.confirm(`Вы уверены, что хотите удалить товар "${row.original.name}"?`)) {
      try {
        await toast.promise(deleteProduct(row.original.id), {
          loading: 'Удаление товара...',
          success: 'Товар успешно удален!',
          error: (err) => err.message || 'Ошибка при удалении',
        });
      } catch (error) {
        console.error('[ERROR]:', error);
        throw error;
      }
    }
  };

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        filterVariant: 'range',
        size: 80,
      },
      {
        accessorKey: 'name',
        header: 'Название',
        filterVariant: 'text',
      },
      {
        accessorKey: 'category.name',
        header: 'Категория',
        filterVariant: 'select',
        filterSelectOptions: data
          ? Array.from(new Set(data.map((product) => product.category.name)))
          : [],
      },
      {
        accessorKey: 'price',
        header: 'Цена',
        filterVariant: 'range',
        Cell: ({ cell }) => `${cell.getValue<number>().toLocaleString()} ₽`,
      },
      {
        accessorKey: 'stockQuantity',
        header: 'Остаток',
        filterVariant: 'range',
      },
      {
        accessorKey: 'isAvailable',
        header: 'Доступен',
        filterVariant: 'select',
        filterSelectOptions: [
          { value: 'true', text: 'Да' },
          { value: 'false', text: 'Нет' },
        ],
        Cell: ({ cell }) => (cell.getValue() ? 'Да' : 'Нет'),
        size: 100,
      },
      {
        accessorKey: 'weight',
        header: 'Вес (г)',
        filterVariant: 'range',
      },
      {
        accessorKey: 'eValue',
        header: 'Энерг. ценность',
        filterVariant: 'range',
      },
      {
        accessorFn: (originalRow) => new Date(originalRow.createdAt),
        accessorKey: 'createdAt',
        header: 'Дата создания',
        filterVariant: 'datetime-range',
        muiFilterDateTimePickerProps: {
          ampm: false,
          format: 'DD.MM.YYYY HH:mm',
        },
        Cell: ({ cell }) =>
          dayjs(cell.getValue<string>()).format('DD.MM.YYYY HH:mm'),
      },
      {
        accessorFn: (originalRow) => new Date(originalRow.updatedAt),
        accessorKey: 'updatedAt',
        header: 'Дата обновления',
        filterVariant: 'datetime-range',
        muiFilterDateTimePickerProps: {
          ampm: false,
          format: 'DD.MM.YYYY HH:mm',
        },
        Cell: ({ cell }) =>
          dayjs(cell.getValue<string>()).format('DD.MM.YYYY HH:mm'),
      },
    ],
    [data]
  );

  const table = useMaterialReactTable({
    columns,
    data: data || [],
    state: { isLoading },
    enableEditing: true,
    initialState: { columnOrder: columns.map(col => col.accessorKey as string) },
    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => router.push(`/admin/products/create`)}
        sx={{ mr: 2 }}
      >
        Создать товар
      </Button>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Tooltip title="Редактировать">
          <IconButton onClick={() => router.push(`/admin/products/${row.original.id}/edit`)}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Просмотр деталей">
          <IconButton
            onClick={() => {
              setSelectedProduct(row.original);
              setDetailsDialogOpen(true);
            }}
          >
            <Visibility />
          </IconButton>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton color="error" onClick={() => handleDeleteProduct(row)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="ru"
      >
        <MaterialReactTable table={table} />
      </LocalizationProvider>

      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Детали товара</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-2">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-contain"
                />
              </div>
              <div><strong>Название:</strong></div>
              <div>{selectedProduct.name}</div>
              
              <div><strong>Категория:</strong></div>
              <div>{selectedProduct.category.name}</div>
              
              <div><strong>Описание:</strong></div>
              <div>{selectedProduct.description || 'Нет описания'}</div>
              
              <div><strong>Цена:</strong></div>
              <div>{selectedProduct.price.toLocaleString()} ₽</div>
              
              <div><strong>Вес:</strong></div>
              <div>{selectedProduct.weight} г</div>
              
              <div><strong>Энергетическая ценность:</strong></div>
              <div>{selectedProduct.eValue} ккал</div>
              
              <div><strong>Доступен:</strong></div>
              <div>{selectedProduct.isAvailable ? 'Да' : 'Нет'}</div>
              
              <div><strong>Остаток на складе:</strong></div>
              <div>{selectedProduct.stockQuantity} шт.</div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductTable;
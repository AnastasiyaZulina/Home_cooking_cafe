// app/admin/(dashboard)/orders/page.tsx
'use client';
import { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MRT_Row,
} from 'material-react-table';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { OrderStatus, DeliveryType, PaymentMethod } from '@prisma/client';

type Order = {
  id: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  name: string;
  email: string;
  total: number;
  createdAt: string;
  user?: {
    email: string;
    name: string;
  };
  items: Array<{
    productName: string;
    productQuantity: number;
    productPrice: number;
  }>;
};

const OrdersTable = () => {
  const queryClient = useQueryClient();
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Получение данных
  const { data, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders');
      return response.json();
    },
  });

  // Мутация для обновления
  const { mutateAsync: updateOrder } = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при обновлении заказа');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Заказ успешно обновлен');
    },
    onError: (error) => {
      toast.error(error.message || 'Произошла ошибка');
    },
  });

  // Мутация для удаления
  const { mutateAsync: deleteOrder } = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при удалении заказа');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Заказ успешно удален');
    },
    onError: (error) => {
      toast.error(error.message || 'Произошла ошибка при удалении');
    },
  });

  // Обработчик удаления
  const handleDeleteOrder = async (row: MRT_Row<Order>) => {
    if (window.confirm(`Вы уверены, что хотите удалить заказ #${row.original.id}?`)) {
      try {
        await toast.promise(
          deleteOrder(row.original.id),
          {
            loading: 'Удаление заказа...',
            success: 'Заказ успешно удален!',
            error: (err) => err.message || 'Ошибка при удалении',
          }
        );
      } catch (error) {
        // Ошибка уже обработана в toast.promise
      }
    }
  };

  // Обработчик сохранения изменений
  const handleSaveOrder = async ({ row, values }: { row: MRT_Row<Order>; values: Partial<Order> }) => {
    try {
      await toast.promise(
        updateOrder({ id: row.original.id, ...values }),
        {
          loading: 'Обновление заказа...',
          success: 'Заказ успешно обновлен!',
          error: (err) => err.message || 'Ошибка при обновлении',
        }
      );
    } catch (error) {
      // Ошибка уже обработана в toast.promise
    }
  };

  // Колонки таблицы
  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
        enableEditing: false,
      },
      {
        accessorKey: 'status',
        header: 'Статус',
        editVariant: 'select',
        editSelectOptions: Object.values(OrderStatus),
        muiEditTextFieldProps: {
          select: true,
        },
      },
      {
        accessorKey: 'email',
        header: 'Почта клиента',
        enableEditing: false,
      },
      {
        accessorKey: 'name',
        header: 'Имя',
        enableEditing: false,
      },
      {
        accessorKey: 'userId',
        header: 'ID клиента',
        size: 80,
        enableEditing: false,
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Способ оплаты',
        editVariant: 'select',
        editSelectOptions: Object.values(PaymentMethod),
        muiEditTextFieldProps: {
          select: true,
        },
        enableEditing: false,
      },
      {
        accessorKey: 'paymentId',
        header: 'Ключ платежа',
        size: 80,
        enableEditing: false,
      },
      {
        accessorKey: 'deliveryType',
        header: 'Доставка/самовывоз',
        editVariant: 'select',
        editSelectOptions: Object.values(DeliveryType),
        muiEditTextFieldProps: {
          select: true,
        },
      },
      {
        accessorKey: 'deliveryTime',
        header: 'Время доставки/самовывоза',
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
      {
        accessorKey: 'deliveryCost',
        header: 'Стоимость доставки/самовывоза',
      },
      {
        accessorKey: 'createdAt',
        header: 'Дата создания',
        enableEditing: false,
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
    ],
    []
  );

  // Создание таблицы
  const table = useMaterialReactTable({
    columns,
    data: data || [],
    state: { isLoading },
    enableEditing: true,
    editDisplayMode: 'row',
    onEditingRowSave: handleSaveOrder,
    onEditingRowCancel: () => setValidationErrors({}),
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
            onClick={() => handleDeleteOrder(row)}
          >
            <Delete />
          </IconButton>
        </Tooltip>
        <Tooltip title="Просмотр">
          <IconButton 
            color="info" 
            onClick={() => window.open(`/admin/orders/${row.original.id}`, '_blank')}
          >
            <Visibility />
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

export default OrdersTable;
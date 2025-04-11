'use client'

import React, { useMemo, useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
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
import updateLocale from 'dayjs/plugin/updateLocale';
import dayjs from 'dayjs';

dayjs.extend(updateLocale);
dayjs.locale('ru');
dayjs.updateLocale('ru', {
  formats: {
    time: 'HH:mm',
    timePicker: 'HH:mm',
  },
});

type Order = {
  id: number;
  status: 'PENDING' | 'SUCCEEDED' | 'READY' | 'DELIVERY' | 'CANCELLED' | 'COMPLETED';
  paymentMethod: 'ONLINE' | 'OFFLINE';
  deliveryType: 'PICKUP' | 'DELIVERY';
  deliveryTime: string;
  deliveryCost?: number;
  userId?: number;
  bonusDelta: number;
  name: string;
  address?: string;
  email: string;
  phone: string;
  comment?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

type OrderItem = {
  productId: number;
  productName: string;
  productQuantity: number;
  productPrice: number;
};

const getStatusText = (
  status: Order['status'],
  deliveryType: Order['deliveryType'],
  paymentMethod: Order['paymentMethod']
) => {
  switch (status) {
    case 'PENDING':
      return paymentMethod === 'ONLINE' ? 'Ожидает оплаты' : 'Принят';
    case 'SUCCEEDED':
      return deliveryType === 'DELIVERY' ? 'Оплачен, готовится к отправке' : 'Оплачен, готовится';
    case 'DELIVERY':
      return 'В пути';
    case 'READY':
      return 'Готов к получению';
    case 'COMPLETED':
      return 'Завершён';
    case 'CANCELLED':
      return 'Отменён';
    default:
      return status;
  }
};

const OrderTable = () => {
  const queryClient = useQueryClient();
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders');
      return response.json();
    },
  });

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
    },
  });

  const handleDeleteOrder = async (row: MRT_Row<Order>) => {
    if (window.confirm(`Вы уверены, что хотите удалить заказ #${row.original.id}?`)) {
      try {
        await toast.promise(deleteOrder(row.original.id), {
          loading: 'Удаление заказа...',
          success: 'Заказ успешно удален!',
          error: (err) => err.message || 'Ошибка при удалении',
        });
      } catch (error) {
        console.error('[ERROR]:', error);
        throw error;
      }
    }
  };

  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        filterVariant: 'range',
        // size: 80,
      },
      {
        accessorKey: 'status',
        header: 'Статус',
        filterVariant: 'select',
        filterSelectOptions: [
          'PENDING',
          'SUCCEEDED',
          'READY',
          'DELIVERY',
          'CANCELLED',
          'COMPLETED',
        ].map(status => ({
          text: getStatusText(
            status as Order['status'],
            'DELIVERY',
            'ONLINE'
          ),
          value: status,
        })),
        Cell: ({ row }) =>
          getStatusText(
            row.original.status,
            row.original.deliveryType,
            row.original.paymentMethod
          ),
        // size: 100,
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Способ оплаты',
        filterVariant: 'select',
        filterSelectOptions: ['ONLINE', 'OFFLINE'].map(method => ({
          text: method === 'ONLINE' ? 'Онлайн' : 'При получении',
          value: method,
        })),
        Cell: ({ cell }) =>
          cell.getValue<string>() === 'ONLINE' ? 'Онлайн' : 'При получении',
        //size: 150,
      },
      {
        accessorKey: 'deliveryType',
        header: 'Тип доставки',
        filterVariant: 'select',
        filterSelectOptions: ['PICKUP', 'DELIVERY'].map(type => ({
          text: type === 'PICKUP' ? 'Самовывоз' : 'Доставка',
          value: type,
        })),
        Cell: ({ cell }) =>
          cell.getValue<string>() === 'PICKUP' ? 'Самовывоз' : 'Доставка',
        //size: 150,
      },
      {
        accessorKey: 'deliveryCost',
        header: 'Стоимость доставки',
        filterVariant: 'range',
        // size: 150,
      },
      {
        accessorFn: (originalRow) => new Date(originalRow.deliveryTime),
        accessorKey: 'deliveryTime',
        header: 'Время доставки',
        filterVariant: 'datetime-range',
        muiFilterDateTimePickerProps: {
          ampm: false,
          format: 'DD.MM.YYYY HH:mm',
        },
        Cell: ({ cell }) =>
          dayjs(cell.getValue<string>()).format('DD.MM.YYYY HH:mm'),
      },
      {
        accessorKey: 'name',
        header: 'Имя клиента',
        filterVariant: 'text',
        // size: 200,
      },
      {
        accessorKey: 'address',
        header: 'Адрес',
        filterVariant: 'text',
        //size: 200,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        filterVariant: 'text',
        //size: 200,
      },
      {
        accessorKey: 'phone',
        header: 'Телефон',
        filterVariant: 'text',
        // size: 150,
      },
      {
        accessorKey: 'comment',
        header: 'Комментарий',
        filterVariant: 'text',
        // size: 200,
      },
      {
        accessorKey: 'userId',
        header: 'ID клиента',
        filterVariant: 'range',
        // size: 150,
      },
      {
        accessorKey: 'bonusDelta',
        header: 'Бонусы',
        filterVariant: 'range',
        // size: 150,
      },
      {
        accessorKey: 'paymentId',
        header: 'ID платежа',
        filterVariant: 'text',
        // size: 150,
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
    []
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
        onClick={() => router.push(`/admin/orders/create`)}
        sx={{ mr: 2 }}
      >
        Создать заказ
      </Button>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Tooltip title="Редактировать">
          <IconButton onClick={() => router.push(`/admin/orders/${row.original.id}/edit`)}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Позиции заказа">
          <IconButton
            onClick={() => {
              setSelectedOrder(row.original);
              setSelectedOrderItems(row.original.items);
              setItemsDialogOpen(true);
            }}
          >
            <Visibility />
          </IconButton>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton color="error" onClick={() => handleDeleteOrder(row)}>
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
        open={itemsDialogOpen}
        onClose={() => setItemsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Позиции заказа</DialogTitle>
        <DialogContent>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2">ID товара</th>
                <th className="text-left p-2">Название</th>
                <th className="text-left p-2">Количество</th>
                <th className="text-left p-2">Цена</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrderItems?.length > 0 ? (
                selectedOrderItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2">{item.productId}</td>
                    <td className="p-2">{item.productName}</td>
                    <td className="p-2">{item.productQuantity}</td>
                    <td className="p-2">{item.productPrice} ₽</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-2 text-center">
                    Нет позиций в заказе
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Расчёты */}
          {selectedOrderItems.length > 0 && (
            <Box mt={3}>
              {(() => {
                const totalItemsPrice = selectedOrderItems.reduce(
                  (acc, item) => acc + item.productPrice * item.productQuantity,
                  0
                );
                const deliveryCost = selectedOrder?.deliveryCost || 0;
                const bonusDelta = (selectedOrder?.bonusDelta ?? 0) < 0 ? selectedOrder?.bonusDelta ?? 0 : 0;
                const total = totalItemsPrice + deliveryCost + bonusDelta;

                return (
                  <Box className="space-y-2 mt-4 text-left">
                    <div>Стоимость товаров: <strong>{totalItemsPrice.toLocaleString()} ₽</strong></div>
                    <div>Доставка: <strong>{deliveryCost.toLocaleString()} ₽</strong></div>
                    <div>
                      {selectedOrder?.bonusDelta && selectedOrder.bonusDelta > 0
                        ? `Начислено бонусов: `
                        : `Списано бонусов: `}
                      <strong>{Math.abs(selectedOrder?.bonusDelta ?? 0).toLocaleString()} ₽</strong>
                    </div>
                    <div><strong>ИТОГО: {total.toLocaleString()} ₽</strong></div>
                  </Box>
                );
              })()}
            </Box>
          )}

        </DialogContent>

        <DialogActions>
          <Button onClick={() => setItemsDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderTable;

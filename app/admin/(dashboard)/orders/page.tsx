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
import { Order, OrderItem } from '@/@types/orders';
import { Api } from '@/shared/services/api-clients';

dayjs.extend(updateLocale);
dayjs.locale('ru');
dayjs.updateLocale('ru', {
  formats: {
    time: 'HH:mm',
    timePicker: 'HH:mm',
  },
});

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

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => {
      return Api.orders.getOrders();
    },
  });

  const { mutateAsync: deleteOrder } = useMutation({
    mutationFn: (id: number) => Api.orders.deleteOrder(id),
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
      },
      {
        accessorKey: 'deliveryCost',
        header: 'Стоимость доставки',
        filterVariant: 'range',
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
      },
      {
        accessorKey: 'address',
        header: 'Адрес',
        filterVariant: 'text',
      },
      {
        accessorKey: 'email',
        header: 'Email',
        filterVariant: 'text',
      },
      {
        accessorKey: 'phone',
        header: 'Телефон',
        filterVariant: 'text',
      },
      {
        accessorKey: 'comment',
        header: 'Комментарий',
        filterVariant: 'text',
      },
      {
        accessorKey: 'userId',
        header: 'ID клиента',
        filterVariant: 'range',
      },
      {
        accessorKey: 'bonusDelta',
        header: 'Бонусы',
        filterVariant: 'range',
      },
      {
        accessorKey: 'paymentId',
        header: 'ID платежа',
        filterVariant: 'text',
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
    data: orders || [],
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
          <IconButton onClick={() => router.push(`/admin/orders/${row.original.id}`)}>
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

'use client';
import { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
  type MRT_Row,
  MRT_TableOptions,
} from 'material-react-table';
import { Box, Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { Edit, Delete, Visibility, Add } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Order = {
  id: number;
  status: 'PENDING' | 'SUCCEEDED' | 'READY' | 'DELIVERY' | 'CANCELLED' | 'COMPLETED';
  paymentMethod: 'ONLINE' | 'OFFLINE';
  deliveryType: 'PICKUP' | 'DELIVERY';
  deliveryTime: string;
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
      return deliveryType === 'DELIVERY' ? 'Оплачен' : 'Готов к обработке';
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
  // Получение данных
  const { data, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders');
      return response.json();
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
      },
    });

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

  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
      },
      {
        accessorKey: 'name',
        header: 'Имя клиента',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'phone',
        header: 'Телефон',
      },
      {
        accessorKey: 'deliveryTime',
        header: 'Время доставки',
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
      {
        accessorKey: 'deliveryType',
        header: 'Тип доставки',
        Cell: ({ cell }) => cell.getValue<string>() === 'PICKUP' ? 'Самовывоз' : 'Доставка',
      },
      {
        accessorKey: 'status',
        header: 'Статус',
        Cell: ({ row }) => getStatusText(
          row.original.status,
          row.original.deliveryType,
          row.original.paymentMethod
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Дата создания',
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: data || [],
    state: { isLoading },
    enableRowActions: true,
    enableEditing: false,
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
              setSelectedOrderItems(row.original.items);
              setItemsDialogOpen(true);
            }}
          >
            <Visibility />
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
      </Box>
    ),
  });

  return (
    <>
      <MaterialReactTable table={table} />
      
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
              {selectedOrderItems.map((item, index) => (
                <tr key={index}>
                  <td className="p-2">{item.productId}</td>
                  <td className="p-2">{item.productName}</td>
                  <td className="p-2">{item.productQuantity}</td>
                  <td className="p-2">{item.productPrice} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemsDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderTable;
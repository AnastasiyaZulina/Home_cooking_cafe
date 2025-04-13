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
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { type MRT_ColumnFiltersState } from 'material-react-table';

dayjs.extend(updateLocale);
dayjs.locale('ru');
dayjs.updateLocale('ru', {
  formats: {
    time: 'HH:mm',
    timePicker: 'HH:mm',
  },
});

type Feedback = {
  id: number;
  userId: number;
  user: {
    name: string;
    email: string;
  };
  feedbackText: string;
  feedbackStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type FeedbackFormValues = {
  feedbackText: string;
  feedbackStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isVisible: boolean;
};
type DateRange = {
    from?: string;
    to?: string;
  };
const FeedbackTable = () => {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([]);

  // Fetch feedback data
  const { data: feedbacks, isLoading } = useQuery<Feedback[]>({
    queryKey: ['feedbacks', columnFilters],
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

      const response = await fetch(`/api/admin/feedbacks?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch feedbacks');
      return response.json();
    },
  });

  // Mutations
  const { mutateAsync: deleteFeedback } = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/feedbacks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete feedback');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Отзыв успешно удален');
    },
  });

  const { mutateAsync: updateFeedback } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FeedbackFormValues> }) => {
      const response = await fetch(`/api/admin/feedbacks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update feedback');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Отзыв успешно обновлен');
    },
  });

  // Handlers
  const handleDeleteFeedback = async (row: MRT_Row<Feedback>) => {
    if (window.confirm(`Вы уверены, что хотите удалить отзыв от "${row.original.user.name}"?`)) {
      try {
        await deleteFeedback(row.original.id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleEditRow = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setEditDialogOpen(true);
  };

  const validateForm = (values: FeedbackFormValues) => {
    const errors: Partial<Record<keyof FeedbackFormValues, string>> = {};
    if (!values.feedbackText.trim()) errors.feedbackText = 'Обязательное поле';
    return errors;
  };

  // Table columns
  const columns = useMemo<MRT_ColumnDef<Feedback>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', size: 80, filterVariant: 'range' },
      { accessorKey: 'user.id', header: 'ID пользователя' },
      { accessorKey: 'user.name', header: 'Имя пользователя' },
      { accessorKey: 'user.email', header: 'Email пользователя' },
      {
        accessorKey: 'feedbackText',
        header: 'Текст отзыва',
        Cell: ({ cell }) => (
          <div style={{ whiteSpace: 'pre-line' }}>{cell.getValue<string>()}</div>
        ),
      },
      {
        accessorKey: 'feedbackStatus',
        header: 'Статус',
        filterVariant: 'select',
        filterSelectOptions: [
          { value: 'PENDING', label: 'На рассмотрении' },
          { value: 'APPROVED', label: 'Одобрено' },
          { value: 'REJECTED', label: 'Отклонено' },
        ],
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          switch (status) {
            case 'PENDING':
              return 'На рассмотрении';
            case 'APPROVED':
              return 'Одобрено';
            case 'REJECTED':
              return 'Отклонено';
            default:
              return status;
          }
        },
      },
      {
        accessorKey: 'isVisible',
        header: 'Видимость',
        filterVariant: 'checkbox',
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Да' : 'Нет'),
      },
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
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: feedbacks || [],
    state: { isLoading, columnFilters },
    onColumnFiltersChange: setColumnFilters,
    enableEditing: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Tooltip title="Редактировать">
          <IconButton onClick={() => handleEditRow(row.original)}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton color="error" onClick={() => handleDeleteFeedback(row)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <MaterialReactTable table={table} />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Редактировать отзыв</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Текст отзыва"
            required
            multiline
            rows={4}
            value={selectedFeedback?.feedbackText || ''}
            onChange={(e) =>
              setSelectedFeedback(prev =>
                prev ? { ...prev, feedbackText: e.target.value } : null
              )
            }
            error={!selectedFeedback?.feedbackText?.trim()}
            helperText={!selectedFeedback?.feedbackText?.trim() && 'Обязательное поле'}
          />
          <TextField
            select
            label="Статус"
            value={selectedFeedback?.feedbackStatus || 'PENDING'}
            onChange={(e) =>
              setSelectedFeedback(prev =>
                prev
                  ? {
                      ...prev,
                      feedbackStatus: e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED',
                    }
                  : null
              )
            }
          >
            <MenuItem value="PENDING">На рассмотрении</MenuItem>
            <MenuItem value="APPROVED">Одобрен</MenuItem>
            <MenuItem value="REJECTED">Отклонен</MenuItem>
          </TextField>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFeedback?.isVisible || false}
                onChange={(e) =>
                  setSelectedFeedback(prev =>
                    prev ? { ...prev, isVisible: e.target.checked } : null
                  )
                }
              />
            }
            label="Показывать на сайте"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (selectedFeedback && selectedFeedback.feedbackText.trim()) {
                await updateFeedback({
                  id: selectedFeedback.id,
                  data: {
                    feedbackText: selectedFeedback.feedbackText,
                    feedbackStatus: selectedFeedback.feedbackStatus,
                    isVisible: selectedFeedback.isVisible,
                  },
                });
                setEditDialogOpen(false);
              }
            }}
            disabled={!selectedFeedback?.feedbackText.trim()}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default FeedbackTable;
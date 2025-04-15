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
  Typography,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Image from 'next/image';
import { Api } from '@/shared/services/api-clients';

type Category = {
  id: number;
  name: string;
};

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
  category: Category;
};

type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  weight: number;
  eValue: number;
  isAvailable: boolean;
  stockQuantity: number;
  categoryId: number;
  image?: File;
};

const ProductTable = () => {
  const queryClient = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [newStockQuantity, setNewStockQuantity] = useState<number>(0);

  const [createFormValues, setCreateFormValues] = useState<Omit<ProductFormValues, 'image'>>({
    name: '',
    description: '',
    price: 0,
    weight: 0,
    eValue: 0,
    isAvailable: true,
    stockQuantity: 0,
    categoryId: 0,
  });

  const [editFormValues, setEditFormValues] = useState<ProductFormValues>({
    name: '',
    description: '',
    price: 0,
    weight: 0,
    eValue: 0,
    isAvailable: true,
    stockQuantity: 0,
    categoryId: 0,
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: Api.products.getProducts,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: Api.products.getCategories,
  });

  useEffect(() => {
    if (editFormValues.stockQuantity <= 0) {
      setEditFormValues(prev => ({
        ...prev,
        isAvailable: false
      }));
    }
  }, [editFormValues.stockQuantity]);


  useEffect(() => {
    if (createFormValues.stockQuantity <= 0) {
      setCreateFormValues(prev => ({
        ...prev,
        isAvailable: false
      }));
    }
  }, [createFormValues.stockQuantity]);

  // Mutations
  const { mutateAsync: deleteProduct } = useMutation({
    mutationFn: Api.products.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Товар успешно удален');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ошибка при удалении товара');
    },
  });

  const { mutateAsync: bulkUpdateStock } = useMutation({
    mutationFn: Api.products.bulkUpdateStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Наличие успешно обновлено');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ошибка при обновлении наличия');
    },
  });

  const { mutateAsync: createProduct } = useMutation({
    mutationFn: Api.products.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Товар успешно создан');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ошибка при создании товара');
    },
  });

  const { mutateAsync: updateProduct } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => 
      Api.products.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Товар успешно обновлен');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ошибка при обновлении товара');
    },
  });

  // Handlers

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) {
      toast.error('Выберите товары для обновления');
      return;
    }
    if (newStockQuantity < 0) {
      toast.error('Количество не может быть отрицательным');
      return;
    }

    try {
      await bulkUpdateStock({
        ids: selectedIds,
        quantity: newStockQuantity
      });
      setSelectedIds([]);
      setNewStockQuantity(0);
    } catch (error) {
      console.error('Bulk update error:', error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка формата файла
    const allowedTypes = ['image/svg+xml', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Допустимые форматы: SVG, JPG, JPEG, PNG, WEBP');
      return;
    }

    try {
      // Создаем URL для файла
      const imageUrl = URL.createObjectURL(file);

      // Загружаем изображение
      const img = new window.Image();
      img.src = imageUrl;

      // Ждем загрузки изображения
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Создаем canvas для обрезки
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Определяем размеры для обрезки (1:1)
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      // Вычисляем координаты для обрезки (центрирование)
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;

      // Обрезаем изображение
      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        size,
        size,
        0,
        0,
        size,
        size
      );

      // Конвертируем canvas обратно в файл
      canvas.toBlob((blob) => {
        if (!blob) return;

        // Создаем новый файл с обрезанным изображением
        const croppedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        // Обновляем состояние
        setSelectedImage(croppedFile);
        setImagePreviewUrl(URL.createObjectURL(croppedFile));

        // Очищаем URL
        URL.revokeObjectURL(imageUrl);
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Ошибка при обработке изображения');
    }
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка формата файла
    const allowedTypes = ['image/svg+xml', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Допустимые форматы: SVG, JPG, JPEG, PNG, WEBP');
      return;
    }

    try {
      // Создаем URL для файла
      const imageUrl = URL.createObjectURL(file);

      // Загружаем изображение
      const img = new window.Image();
      img.src = imageUrl;

      // Ждем загрузки изображения
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Создаем canvas для обрезки
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Определяем размеры для обрезки (1:1)
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      // Вычисляем координаты для обрезки (центрирование)
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;

      // Обрезаем изображение
      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        size,
        size,
        0,
        0,
        size,
        size
      );

      // Конвертируем canvas обратно в файл
      canvas.toBlob((blob) => {
        if (!blob) return;

        // Создаем новый файл с обрезанным изображением
        const croppedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        // Обновляем состояние
        setEditImage(croppedFile);
        setEditPreviewUrl(URL.createObjectURL(croppedFile));

        // Очищаем URL
        URL.revokeObjectURL(imageUrl);
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Ошибка при обработке изображения');
    }
  };

  const handleDeleteProduct = async (row: MRT_Row<Product>) => {
    if (window.confirm(`Вы уверены, что хотите удалить товар "${row.original.name}"?`)) {
      try {
        await deleteProduct(row.original.id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleEditRow = (product: Product) => {
    setEditFormValues({
      name: product.name,
      description: product.description || '',
      price: product.price,
      weight: product.weight,
      eValue: product.eValue,
      isAvailable: product.isAvailable,
      stockQuantity: product.stockQuantity,
      categoryId: product.category.id,
    });
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;

    try {
      const formData = new FormData();
      formData.append('name', editFormValues.name);
      formData.append('description', editFormValues.description);
      formData.append('price', editFormValues.price.toString());
      formData.append('weight', editFormValues.weight.toString());
      formData.append('eValue', editFormValues.eValue.toString());
      formData.append('stockQuantity', editFormValues.stockQuantity.toString());
      formData.append('isAvailable', editFormValues.isAvailable.toString());
      formData.append('categoryId', editFormValues.categoryId.toString());

      if (editImage) {
        formData.append('image', editImage);
      }
      const stock = Number(editFormValues.stockQuantity);
      const isAvailable = stock > 0 ? editFormValues.isAvailable : false;

      formData.append('stockQuantity', stock.toString());
      formData.append('isAvailable', isAvailable.toString());

      await updateProduct({
        id: selectedProduct.id,
        data: formData
      });

      setEditDialogOpen(false);
      setEditImage(null);
      setEditPreviewUrl(null);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleCreateProduct = async () => {
    if (!selectedImage) {
      toast.error('Пожалуйста, загрузите изображение товара');
      return;
    }

    const formData = new FormData();
    formData.append('name', createFormValues.name);
    formData.append('description', createFormValues.description);
    formData.append('price', createFormValues.price.toString());
    formData.append('weight', createFormValues.weight.toString());
    formData.append('eValue', createFormValues.eValue.toString());
    formData.append('stockQuantity', createFormValues.stockQuantity.toString());
    formData.append('isAvailable', createFormValues.isAvailable.toString());
    formData.append('categoryId', createFormValues.categoryId.toString());
    formData.append('image', selectedImage);

    try {
      await createProduct(formData);
      setCreateFormValues({
        name: '',
        description: '',
        price: 0,
        weight: 0,
        eValue: 0,
        isAvailable: true,
        stockQuantity: 0,
        categoryId: 0,
      });
      setSelectedImage(null);
      setImagePreviewUrl(null);
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  const validateForm = (values: Omit<ProductFormValues, 'image'>) => {
    const errors: Partial<Record<keyof typeof values, string>> = {};

    if (!values.name.trim()) errors.name = 'Обязательное поле';
    if (values.price <= 0) errors.price = 'Цена должна быть больше 0';
    if (values.weight <= 0) errors.weight = 'Вес должен быть больше 0';
    if (values.eValue <= 0) errors.eValue = 'Энергетическая ценность должна быть больше 0';
    if (values.stockQuantity < 0) errors.stockQuantity = 'Количество не может быть отрицательным';
    if (values.categoryId === 0) errors.categoryId = 'Выберите категорию';

    return errors;
  };

  const createErrors = validateForm(createFormValues);
  const editErrors = validateForm(editFormValues);

  // Table columns
  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', size: 80 },
      { accessorKey: 'name', header: 'Название' },
      {
        accessorKey: 'category.name',
        header: 'Категория',
        filterVariant: 'select',
        filterSelectOptions: products
          ? Array.from(new Set(products.map((p) => p.category.name)))
          : [],
      },
      {
        accessorKey: 'price',
        header: 'Цена',
        Cell: ({ cell }) => `${cell.getValue<number>().toLocaleString()} ₽`,
      },
      { accessorKey: 'stockQuantity', header: 'Остаток' },
      {
        accessorKey: 'isAvailable',
        header: 'Доступен',
        Cell: ({ cell }) => (cell.getValue() ? 'Да' : 'Нет'),
      },
      { accessorKey: 'weight', header: 'Вес (г)' },
      { accessorKey: 'eValue', header: 'Энерг. ценность' },
      {
        accessorKey: 'image',
        header: 'Изображение',
        size: 200,
        Cell: ({ cell }) => (
          <Button
            variant="outlined"
            onClick={() => {
              setSelectedProduct({
                ...cell.row.original,
                image: cell.getValue() as string,
              });
              setDetailsDialogOpen(true);
            }}
          >
            Посмотреть
          </Button>
        ),
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
    [products]
  );

  // Table instance
  const table = useMaterialReactTable({
    columns,
    data: products || [],
    getRowId: (row) => row.id?.toString() ?? '',
    state: {
      isLoading,
      rowSelection: selectedIds.reduce((acc, id) => {
        acc[id.toString()] = true;
        return acc;
      }, {} as Record<string, boolean>),
    },
    enableEditing: true,
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const newSelection = updater instanceof Function
        ? updater(table.getState().rowSelection)
        : updater;
      const ids = Object.keys(newSelection)
        .filter(key => newSelection[key])
        .map(key => parseInt(key));
      setSelectedIds(ids);
    },
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => table.setCreatingRow(true)}
        >
          Создать товар
        </Button>

        <TextField
          size="small"
          type="number"
          label="Новое количество"
          value={newStockQuantity}
          onChange={(e) => setNewStockQuantity(Number(e.target.value))}
          inputProps={{ min: 0 }}
          sx={{ width: 100 }}
        />

        <Button
          variant="outlined"
          onClick={handleBulkUpdate}
          disabled={selectedIds.length === 0 || newStockQuantity < 0}
        >
          Обновить наличие
        </Button>
      </Box>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Tooltip title="Редактировать">
          <IconButton onClick={() => handleEditRow(row.original)}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton color="error" onClick={() => handleDeleteProduct(row)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderCreateRowDialogContent: ({ table }) => (
      <>
        <DialogTitle>Создать новый товар</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Название"
            required
            value={createFormValues.name}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, name: e.target.value }))}
            error={!!createErrors.name}
            helperText={createErrors.name}
          />

          <TextField
            label="Описание"
            multiline
            rows={3}
            value={createFormValues.description}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, description: e.target.value }))}
          />

          <TextField
            select
            label="Категория"
            required
            value={createFormValues.categoryId}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
            error={!!createErrors.categoryId}
            helperText={createErrors.categoryId}
          >
            <MenuItem value={0} disabled>
              Выберите категорию
            </MenuItem>
            {categories?.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Цена"
            type="number"
            required
            value={createFormValues.price}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, price: Number(e.target.value) }))}
            error={!!createErrors.price}
            helperText={createErrors.price}
            InputProps={{ endAdornment: '₽' }}
          />

          <TextField
            label="Вес (г)"
            type="number"
            required
            value={createFormValues.weight}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, weight: Number(e.target.value) }))}
            error={!!createErrors.weight}
            helperText={createErrors.weight}
          />

          <TextField
            label="Энергетическая ценность"
            type="number"
            required
            value={createFormValues.eValue}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, eValue: Number(e.target.value) }))}
            error={!!createErrors.eValue}
            helperText={createErrors.eValue}
          />

          <TextField
            label="Количество на складе"
            type="number"
            required
            value={createFormValues.stockQuantity}
            onChange={(e) => setCreateFormValues(prev => ({ ...prev, stockQuantity: Number(e.target.value) }))}
            error={!!createErrors.stockQuantity}
            helperText={createErrors.stockQuantity}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={createFormValues.stockQuantity > 0 ? createFormValues.isAvailable : false}
                onChange={(e) => setCreateFormValues(prev => ({
                  ...prev,
                  isAvailable: e.target.checked
                }))}
                disabled={createFormValues.stockQuantity <= 0}
              />
            }
            label="Доступен для заказа"
          />

          <Box>
            <Button variant="outlined" component="label">
              Загрузить изображение
              <input
                type="file"
                accept="image/svg+xml, image/jpeg, image/png, image/webp"
                hidden
                onChange={handleImageChange}
              />
            </Button>
            {!selectedImage && (
              <FormHelperText error>Пожалуйста, загрузите изображение. Допустимый формат: SVG, JPG, JPEG, PNG, WEBP</FormHelperText>
            )}
          </Box>

          {imagePreviewUrl && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Изображение сохранится в размере 1:1</Typography>
              <Image
                src={imagePreviewUrl}
                alt="Превью"
                width={200}
                height={200}
                style={{
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => table.setCreatingRow(null)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleCreateProduct}
            disabled={
              Object.keys(createErrors).length > 0 || !selectedImage
            }
          >
            Создать
          </Button>
        </DialogActions>
      </>
    ),
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MaterialReactTable table={table} />

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditPreviewUrl(null);
          setEditImage(null);
        }}
      >
        <DialogTitle>Редактировать товар</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Название"
            required
            value={editFormValues.name}
            onChange={(e) => setEditFormValues(prev => ({ ...prev, name: e.target.value }))}
            error={!!editErrors.name}
            helperText={editErrors.name}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Описание"
            multiline
            rows={3}
            value={editFormValues.description}
            onChange={(e) => setEditFormValues(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
            margin="normal"
          />

          <TextField
            select
            label="Категория"
            required
            value={editFormValues.categoryId}
            onChange={(e) => setEditFormValues(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
            error={!!editErrors.categoryId}
            helperText={editErrors.categoryId}
            fullWidth
            margin="normal"
          >
            <MenuItem value={0} disabled>
              Выберите категорию
            </MenuItem>
            {categories?.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Цена"
            type="number"
            required
            value={editFormValues.price}
            onChange={(e) => setEditFormValues(prev => ({ ...prev, price: Number(e.target.value) }))}
            error={!!editErrors.price}
            helperText={editErrors.price}
            InputProps={{ endAdornment: '₽' }}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Вес (г)"
            type="number"
            required
            value={editFormValues.weight}
            onChange={(e) => setEditFormValues(prev => ({ ...prev, weight: Number(e.target.value) }))}
            error={!!editErrors.weight}
            helperText={editErrors.weight}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Энергетическая ценность"
            type="number"
            required
            value={editFormValues.eValue}
            onChange={(e) => setEditFormValues(prev => ({ ...prev, eValue: Number(e.target.value) }))}
            error={!!editErrors.eValue}
            helperText={editErrors.eValue}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Количество на складе"
            type="number"
            required
            value={editFormValues.stockQuantity}
            onChange={(e) => setEditFormValues(prev => ({ ...prev, stockQuantity: Number(e.target.value) }))}
            error={!!editErrors.stockQuantity}
            helperText={editErrors.stockQuantity}
            fullWidth
            margin="normal"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={editFormValues.stockQuantity > 0 ? editFormValues.isAvailable : false}
                onChange={(e) => setEditFormValues(prev => ({
                  ...prev,
                  isAvailable: e.target.checked
                }))}
                disabled={editFormValues.stockQuantity <= 0}
              />
            }
            label="Доступен для заказа"
          />

          <Box>
            <Typography variant="subtitle2">Текущее изображение:</Typography>
            <Image
              src={editPreviewUrl || selectedProduct?.image || '/placeholder-image.png'}
              alt="Превью"
              width={200}
              height={200}
              style={{
                objectFit: 'cover',
                borderRadius: '4px',
                border: '1px solid #ddd',
                margin: '10px 0'
              }}
            />
          </Box>

          <Box>
            <Button variant="outlined" component="label">
              Заменить изображение
              <input
                type="file"
                accept="image/svg+xml, image/jpeg, image/png, image/webp"
                hidden
                onChange={handleEditImageChange}
              />
            </Button>
            <FormHelperText>
              Допустимые форматы: SVG, JPG, PNG, WEBP
            </FormHelperText>
          </Box>
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

      {/* Image Preview Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)}>
        <DialogTitle>Изображение товара</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Image
              src={selectedProduct.image}
              alt={selectedProduct.name}
              fill
              style={{
                objectFit: 'contain',
                maxHeight: '70vh'
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ProductTable;
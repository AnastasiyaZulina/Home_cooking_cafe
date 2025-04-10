export type Category = {
    id: number;
    name: string;
  };
  
  export type Product = {
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
  
  export type ProductFormValues = {
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
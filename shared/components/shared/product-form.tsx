'use client'

import { TProduct } from "@/@types/prisma";
import { useCartStore } from "@/shared/store";
import toast from "react-hot-toast";
import { SeeProductForm } from "./see-product-form";

interface Props {
    product: TProduct;
    onAddProduct?: VoidFunction;
    onSubmitStarted: () => void;
    onSubmitFinished: () => void;
}
  
export const ProductForm: React.FC<Props> = ({ 
  product, 
  onAddProduct: _onAddProduct,
  onSubmitStarted,
  onSubmitFinished
}) => {
    const addCartItem = useCartStore(state => state.addCartItem);
    const loading = useCartStore(state => state.loading);
  
    const onAddProduct = async () => {
        try {
            onSubmitStarted();
            await addCartItem({
                productId: product.id,
            });
            toast.success('Добавлено в корзину!'); 
            _onAddProduct?.();
        }
        catch (e) {
            toast.error('Не удалось добавить в корзину!');
            console.error(e);
        }
        finally {
            onSubmitFinished();
        }
    };
  
    return (
        <SeeProductForm 
            image={product.image} 
            name={product.name} 
            description={product.description ?? ''} 
            weight={product.weight} 
            eValue={product.eValue} 
            price={product.price}
            loading={loading} 
            onSubmit={onAddProduct}
        />
    );
};
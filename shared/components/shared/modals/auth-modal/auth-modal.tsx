'use client';

import { Button } from "@/shared/components/ui";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { DialogTitle } from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import React from "react";
import { LoginForm } from "./forms/login-form";
import { RegisterForm } from "./forms/register-form";
import { useCartStore } from "@/shared/store";
import { Api } from "@/shared/services/api-clients";
import toast from "react-hot-toast";

interface Props {
    open: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ open, onClose }) => {
    const [type, setType] = React.useState<'login' | 'register'>('login');
    const { fetchCartItems } = useCartStore();

    const handleSuccess = async () => {
        try {
            // Получаем текущий токен корзины
            const cartToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('cartToken='))
                ?.split('=')[1];

            // Если есть токен - выполняем слияние
            if (cartToken) {
                await Api.cart.mergeCarts({ cartToken });

                // Очищаем токен
                document.cookie = 'cartToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }

            // Обновляем данные
            await fetchCartItems();
        } catch (error) {
            toast.error('Ошибка обновления корзины');
        } finally {
            onClose();
        }
    };

    const onSwitchType = () => {
        setType(type === 'login' ? 'register' : 'login');
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[450px] bg-white p-10">
                {type === 'login' ? (
                    <LoginForm onClose={handleSuccess} />
                ) : (
                    <RegisterForm onClose={handleSuccess} />
                )}
                <VisuallyHidden>
                    <DialogTitle>Авторизация</DialogTitle>
                </VisuallyHidden>
                <hr />

                <Button variant="outline" onClick={onSwitchType} type="button" className="h-12">
                    {type !== 'login' ? 'Войти' : 'Регистрация'}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
'use client';

import { Button } from "@/shared/components/ui";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { DialogTitle } from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { signIn, useSession } from "next-auth/react";
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
    const handleGoogleSignIn = async () => {
        try {
          // 1. Сохраняем cartToken в localStorage перед авторизацией
          const cartToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('cartToken='))
            ?.split('=')[1];
          
          if (cartToken) {
            localStorage.setItem('pendingCartMerge', cartToken);
          }
      
          // 2. Выполняем вход
          const result = await signIn('google', { callback: '/', redirect: false });
          if (result?.error) throw new Error(result.error);
      
          // 3. Ожидаем обновления сессии с таймаутом
          const { update } = useSession();
          let session;
          let attempts = 0;
          
          do {
            session = await update();
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log('ждём');
          } while (!session?.user?.id && attempts < 5);
      
          // 4. Выполняем мерж корзин
          const savedToken = localStorage.getItem('pendingCartMerge');
          if (savedToken) {
            await Api.cart.mergeCarts({ cartToken: savedToken });
            document.cookie = 'cartToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            localStorage.removeItem('pendingCartMerge');
          }
      
          await fetchCartItems();
          onClose();
        } catch (error) {
          console.error('Google auth error:', error);
          toast.error('Ошибка авторизации через Google');
        }
      };

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

                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={handleGoogleSignIn}
                        type="button"
                        className="gap-2 h-12 p-2 flex-1">
                        <img
                            className="w-6 h-6"
                            src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                        />
                        Google
                    </Button>
                </div>

                <Button variant="outline" onClick={onSwitchType} type="button" className="h-12">
                    {type !== 'login' ? 'Войти' : 'Регистрация'}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
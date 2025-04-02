'use client';

import { Button } from "@/shared/components/ui";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { DialogTitle } from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { signIn } from "next-auth/react";
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
          console.log('Auth success, checking cookies...');
          const cartToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('cartToken='))
            ?.split('=')[1];
      
          console.log('Cart token in auth modal:', cartToken);
      
          if (cartToken) {
            console.log('Attempting cart merge...');
            await Api.cart.mergeCarts({ cartToken });
            console.log('Merge completed');
            
            document.cookie = 'cartToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            console.log('Cart token cleared');
          }
      
          console.log('Refreshing cart data...');
          await fetchCartItems();
          
          console.log('Reloading page...');
          window.location.reload();
        } catch (error) {
          console.error('Auth success handler error:', error);
          toast.error('Ошибка обновления данных');
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
                        onClick={() =>
                            signIn('google', {
                                callbackUrl: '/',
                                redirect: true,
                            })
                        }
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
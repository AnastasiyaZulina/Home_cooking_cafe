'use client';

import { Button } from "@/shared/components/ui";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { DialogTitle } from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { signIn } from "next-auth/react";
import React from "react";
import { LoginForm } from "./forms/login-form";
import { RegisterForm } from "./forms/register-form";
import toast from "react-hot-toast";
import { ForgotPasswordForm } from "./forms/forgot-password-form";

interface Props {
    open: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ open, onClose }) => {
    const [type, setType] = React.useState<'login' | 'register' | 'forgot'>('login');

    const onBackToLogin = () => {
        setType('login');
    };

    const handleGoogleLogin = () => {
        const cartToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('cartToken='))
            ?.split('=')[1];

        if (cartToken) {
            localStorage.setItem('pendingCartMerge', cartToken);
        }

        signIn('google', {
            callbackUrl: '/',
            redirect: true,
        });
    };
    
    const handleSuccess = async () => {
        try {
          const cartToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('cartToken='))
            ?.split('=')[1];

            if (cartToken) {
                localStorage.setItem('pendingCartMerge', cartToken);
            }
          
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
                    <LoginForm 
                        onClose={handleSuccess} 
                        onForgotPassword={() => setType('forgot')} 
                    />
                ) : type === 'register' ? (
                    <RegisterForm onClose={handleSuccess} />
                ) : (
                    <ForgotPasswordForm onClose={onClose} onBack={onBackToLogin} />
                )}
                <VisuallyHidden>
                    <DialogTitle>Авторизация</DialogTitle>
                </VisuallyHidden>

                {/* Показываем разделитель и кнопки только для login/register */}
                {type !== 'forgot' && (
                    <>
                        <hr />
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={handleGoogleLogin}
                                type="button"
                                className="gap-2 h-12 p-2 flex-1"
                            >
                                <img
                                    className="w-6 h-6"
                                    src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                                />
                                Google
                            </Button>
                        </div>

                        <Button 
                            variant="outline" 
                            onClick={onSwitchType} 
                            type="button" 
                            className="h-12"
                        >
                            {type !== 'login' ? 'Войти' : 'Регистрация'}
                        </Button>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
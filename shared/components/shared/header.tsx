'use client'

import React, { Suspense } from 'react';
import { Container } from './container';
import Image from 'next/image';
import { cn } from '@/shared/lib/utils';
import { CartButton } from './cart-button';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { ProfileButton } from './profile-button';
import { AuthModal } from './modals';

interface Props {
    hasCart?: boolean;
    className?: string;
}

export const Header: React.FC<Props> = ({ hasCart = true, className }) => {
    const [openAuthModal, setOpenAuthModal] = React.useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <header className={cn('border-b', className)}>
            <Container className="flex items-center justify-between py-8">
                {/* Левая часть */}
                <div className="flex items-center gap-4">
                    <Image src="/logobig.png" alt="Logo" width={55} height={55} />
                    <div>
                        <h1 className="text-xl uppercase font-black">Скатерь-самобранка</h1>
                        <p className="text-sm text-gray-400 leading-3">по-домашнему вкусно!</p>
                    </div>
                </div>

                {/* Правая часть */}
                <div className="flex items-center gap-3">
                    <AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
                    <ProfileButton onClickSignIn={() => setOpenAuthModal(true)} />
                    {hasCart && <CartButton />}
                </div>
            </Container>

            {/* Оборачиваем `useSearchParams` в Suspense */}
            <Suspense fallback={null}>
                <HandleSearchParams router={router} />
            </Suspense>
        </header>
    );
};

// Вынесем `useSearchParams` в отдельный компонент
function HandleSearchParams({ router }: { router: ReturnType<typeof useRouter> }) {
    const searchParams = useSearchParams();

    React.useEffect(() => {
        let toastMessage = '';

        if (searchParams.has('paid')) {
            toastMessage = 'Заказ успешно оплачен! Информация отправлена на почту.';
        }

        if (searchParams.has('verified')) {
            toastMessage = 'Почта успешно подтверждена!';
        }

        if (toastMessage) {
            setTimeout(() => {
                router.replace('/');
                toast.success(toastMessage, { duration: 3000 });
            }, 1000);
        }
    }, [searchParams, router]);

    return null;
}

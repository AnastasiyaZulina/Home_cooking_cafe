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
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { MobileMenu } from './mobile-menu';
import { FloatingCheckout } from './floating-checkout';
import { usePathname } from 'next/navigation';
import { useBreakpoint } from '@/hooks';

interface Props {
    hasCart?: boolean;
    className?: string;
}

export const Header: React.FC<Props> = ({ hasCart = true, className }) => {
    const [openAuthModal, setOpenAuthModal] = React.useState(false);
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const isLargeScreen = useBreakpoint('lg');
    const showFloatingCheckout = hasCart && 
        !isLargeScreen && 
        (pathname === '/' || pathname.startsWith('/product/'));

    return (
        <>
        <header className={cn('border-b', className)}>
            <Container className="flex items-center justify-between py-8 px-4">
                {/* Левая часть */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-x-1 sm:gap-x-4">
                        <Image
                            src="/logobig.png"
                            alt="Logo"
                            width={55}
                            height={55}
                            className="w-10 h-10 sm:w-12 sm:h-12"
                        />
                        <div>
                            <h1 className="text-[16px] sm:text-xl uppercase font-black">Скатерь-самобранка</h1>
                            <p className="text-sm text-gray-400 leading-3">по-домашнему вкусно!</p>
                        </div>
                    </Link>
                </div>

                {/* Центральная часть - навигация */}
                <nav className="hidden lg:flex items-center gap-5 text-[15px] xl:text-[17px] font-bold xl:gap-10">
                    <Link href="/about" className="text-gray-400 hover:text-primary transition-colors">
                        О нас
                    </Link>
                    <Link href="/delivery" className="text-gray-400 hover:text-primary transition-colors">
                        Доставка
                    </Link>
                    <Link href="/reviews" className="text-gray-400 hover:text-primary transition-colors">
                        Отзывы
                    </Link>
                    <Link href="/corporate" className="text-gray-400 hover:text-primary transition-colors">
                        Корпоративным клиентам
                    </Link>
                </nav>
                
                {/* Правая часть */}
                <div className="hidden lg:flex items-center gap-3">
                    <AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
                    <ProfileButton onClickSignIn={() => setOpenAuthModal(true)} />
                    {hasCart && <CartButton />}
                </div>

                <button 
                    className="lg:hidden"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </Container>

            <MobileMenu 
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                onSignInClick={() => setOpenAuthModal(true)}
            />

            <Suspense fallback={null}>
                <HandleSearchParams router={router} />
            </Suspense>
        </header>
        {showFloatingCheckout && <FloatingCheckout />}</>
    );
};

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

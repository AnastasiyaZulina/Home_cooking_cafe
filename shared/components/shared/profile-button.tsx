'use client'

import React from 'react';
import { Button } from '../ui';
import { cn } from '@/shared/lib/utils';
import { ArrowRight, CircleUser, ShoppingCart, User } from 'lucide-react';
import { CartDrawer } from './cart-drawer';
import { useCartStore } from '@/shared/store';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Props {
    onClickSignIn?: () => void;
    className?: string;
}

export const ProfileButton: React.FC<Props> = ({ className, onClickSignIn }) => {
    const { data: session } = useSession();
    const loading = useCartStore(state => state.loading);
    return (
        <div className={className}>
            {
                !session ? <Button loading={loading} onClick={onClickSignIn} variant="outline" className={cn('flex items-center gap-1', { 'w-[105px]': loading }, className)}><User size={16} />Войти</Button> :
                    <Link href="/profile">
                        <Button variant="secondary" className="flex items-center gap-2">
                            <CircleUser size={18} />
                            Профиль
                        </Button>
                    </Link>
            }
        </div>
    );
};
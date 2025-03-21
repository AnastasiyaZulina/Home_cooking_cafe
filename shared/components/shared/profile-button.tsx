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

    return (
        <div className={className}>
            {
                !session ? <Button onClick={onClickSignIn} variant="outline" className="flex items-center gap-1"><User size={16} />Войти</Button> :
                    <Link href="/profile">
                        <Button variant="secondary" className="flex items-center gap-2">
                            <CircleUser size={18} />
                            Профиль
                        </Button>
                    </Link>
            }
        </div>
        /*<Button loading={loading} className={cn('group relative', {'w-[105px]':loading}, className)}>
            <b>{totalAmount} Р</b>
            <span className="h-full w-[1px] bg-white/30 mx-3"/>
            <div className="flex items-center gap-1 transition duration-300 group-hover:opacity-0">
                <ShoppingCart className="h-4 w-4 relative" strokeWidth={2}/>
                <b>{items.length}</b>
            </div>
         </Button>*/
    );
};
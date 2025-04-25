// components/cart-merger.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Api } from '@/shared/services/api-clients';

export const CartMerger = () => {
    const { data: session } = useSession();

    useEffect(() => {
        const mergeCarts = async () => {
            const isNewRegistration = localStorage.getItem('isNewRegistration');

            if (isNewRegistration) {
                localStorage.removeItem('isNewRegistration');
                return;
              }
              
            const pendingCartToken = localStorage.getItem('pendingCartMerge');
            const currentCartToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('cartToken='))
                ?.split('=')[1];

            if (session?.user?.id && (pendingCartToken || currentCartToken)) {
                try {
                    await Api.cart.mergeCarts({ 
                        cartToken: pendingCartToken || currentCartToken || ''
                    });
                    
                    localStorage.removeItem('pendingCartMerge');
                    document.cookie = 'cartToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                } catch (error) {
                    console.error('Ошибка слияния корзин:', error);
                }
            }
        };

        mergeCarts();
    }, [session]);

    return null;
};

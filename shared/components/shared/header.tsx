import React from 'react';
import { Container } from './container';
import Image from 'next/image';
import { Button } from '../ui';
import { ArrowRight, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { CartButton } from './cart-button';

interface Props {
    hasSearch?: boolean;
    hasCart?: boolean;
    className?: string;
  }

export const Header: React.FC<Props> = ({ className}) => {
    return (
      <header className={cn('border-b', className)}>
          <Container className='flex items-center justify-between py-8'>
            {/*Левая часть */}
            <div className="flex items-center gap-4">
                {<Image src="/logobig.png" alt="Logo" width={55} height={55}/>}
                <div>
                    <h1 className="text-xl uppercase font-black">Скатерь-самобранка</h1>
                    <p className="text-sm text-gray-400 leading-3">по-домашнему вкусно!</p>
                </div>
            </div>

            {/*Правая часть*/}
            <div className="flex items-center gap-3">
                <Button variant="outline" className="flex items-center gap-1"><User size={16}/>Войти</Button>
                <CartButton/>
            </div>
          </Container>
        </header>
    );
  };
  
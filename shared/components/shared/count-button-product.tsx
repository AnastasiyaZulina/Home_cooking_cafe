import React from 'react';
import { cn } from '@/shared/lib/utils';
import { CountIconButton } from './count-icon-button';
import { Loader2 } from 'lucide-react';

export interface CountButtonProductProps {
  value?: number;
  size?: 'sm' | 'lg';
  isLoading?: boolean;
  className?: string;
  onClick?: (type: 'plus' | 'minus') => void;
  onReachZero?: () => void; // Новый пропс для обработки нуля
}

export const CountButtonProduct: React.FC<CountButtonProductProps> = ({
    value = 1,
    onClick,
    onReachZero,
    isLoading,
    size = 'sm',
    className,
  }) => {
    const handleClick = (type: 'plus' | 'minus') => {
      if (isLoading) return; // Блокируем клики во время загрузки
  
      const newValue = type === 'plus' ? value + 1 : value - 1;
      
      if (newValue === 0) {
        onReachZero?.(); // Вызываем колбэк при достижении нуля
        return;
      }
      
      onClick?.(type);
    };
  
    return (
      <div className={cn('inline-flex items-center justify-between gap-3', className)}>
        <CountIconButton
          onClick={() => handleClick('minus')}
          disabled={isLoading}
          size={size}
          type="minus"
        />
  
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <b className={size === 'sm' ? 'text-sm' : 'text-md'}>{value}</b>
        )}
  
        <CountIconButton 
          onClick={() => handleClick('plus')} 
          disabled={isLoading}
          size={size} 
          type="plus" 
        />
      </div>
    );
  };
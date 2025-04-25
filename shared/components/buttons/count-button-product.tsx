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
  onReachZero?: () => void;
  max?: number; // Добавляем пропс для максимального значения
}

export const CountButtonProduct: React.FC<CountButtonProductProps> = ({
  value = 1,
  onClick,
  onReachZero,
  isLoading,
  size = 'sm',
  className,
  max, // Получаем максимальное значение
}) => {
  const handleClick = (type: 'plus' | 'minus') => {
    if (isLoading) return;

    const newValue = type === 'plus' ? value + 1 : value - 1;
    
    // Блокируем увеличение при достижении максимума
    if (type === 'plus' && max !== undefined && newValue > max) {
      return;
    }
    
    if (newValue === 0) {
      onReachZero?.();
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
        disabled={isLoading || (max !== undefined && value >= max)} // Блокировка при достижении максимума
        size={size} 
        type="plus" 
      />
    </div>
  );
};
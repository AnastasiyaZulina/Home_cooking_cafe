import React from 'react';
import { cn } from '@/shared/lib/utils';
import { CountIconButton } from './count-icon-button';
import { Loader2 } from 'lucide-react';

export interface CountButtonProps {
  value?: number;
  size?: 'sm' | 'lg';
  className?: string;
  isLoading: boolean;
  onClick?: (type: 'plus' | 'minus') => void;
  max: number;
}

export const CountButton: React.FC<CountButtonProps> = ({
  className,
  max,
  onClick,
  isLoading,
  value = 1,
  size = 'sm',
}) => {
  return (
    <div className={cn('inline-flex items-center justify-between gap-3', className)}>
      <CountIconButton
        onClick={() => onClick?.('minus')}
        disabled={value === 1 || isLoading}
        size={size}
        type="minus"
      />

      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <b className={size === 'sm' ? 'text-sm' : 'text-md'}>{value}</b>
      )}

      <CountIconButton
        onClick={() => onClick?.('plus')}
        size={size}
        type="plus"
        disabled={isLoading || (max !== undefined && value >= max)}
      />
    </div>
  );
};
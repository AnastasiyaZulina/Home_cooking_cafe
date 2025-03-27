import { cn } from '@/shared/lib/utils';
import React from 'react';

interface Props {
    title?: React.ReactNode;
    value?: React.ReactNode;
    className?: string;
}

export const CheckoutItemDetails: React.FC<React.PropsWithChildren<Props>> = ({ 
    title, 
    value, 
    className, 
    children 
}) => {
  return (
    <div className={cn("flex my-3 md:my-4", className)}>
      <span className="flex flex-1 text-base md:text-lg text-neutral-500">
          {title}
          <div className="flex-1 border-b border-dashed border-b-neutral-200 relative -top-1 mx-2" />
      </span>
      <span className="font-bold text-base md:text-lg">{value}</span>
    </div>
  );
};
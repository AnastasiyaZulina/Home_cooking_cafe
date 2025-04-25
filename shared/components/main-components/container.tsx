import { cn } from '@/shared/lib/utils';
import React, { forwardRef } from 'react';

interface Props {
  className?: string;
}

export const Container = forwardRef<HTMLDivElement, React.PropsWithChildren<Props>>(
  ({ className, children }, ref) => {
    return (
      <div ref={ref} className={cn('mx-auto max-w-[1280px] px-5', className)}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
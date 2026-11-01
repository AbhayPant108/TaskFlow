import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  indicatorColor?: string;
}

export function Progress({
  value = 0,
  max = 100,
  indicatorColor,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(percentage)}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full transition-all duration-300 ease-in-out rounded-full',
          indicatorColor || 'bg-indigo-600 dark:bg-indigo-500'
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

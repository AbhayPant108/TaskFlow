import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg font-bold',
};

// Deterministic pastel color for avatars based on name/fallback
function getAvatarBg(name?: string) {
  if (!name) return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
  const colors = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  alt = '',
  fallback = '?',
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const initials = fallback
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const colorClass = getAvatarBg(fallback);

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium select-none ring-1 ring-black/5 dark:ring-white/10',
        sizeClasses[size],
        colorClass,
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || fallback}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

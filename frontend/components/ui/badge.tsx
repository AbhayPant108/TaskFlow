import * as React from 'react';
import { cn } from '@/lib/utils';
import { TaskPriority, TaskStatus } from '@/types/task';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  switch (status) {
    case 'DONE':
      return <Badge variant="success">Done</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="info">In Progress</Badge>;
    case 'TODO':
    default:
      return <Badge variant="secondary">To Do</Badge>;
  }
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  switch (priority) {
    case 'URGENT':
      return <Badge variant="destructive">Urgent</Badge>;
    case 'HIGH':
      return <Badge variant="warning">High</Badge>;
    case 'MEDIUM':
      return <Badge variant="default">Medium</Badge>;
    case 'LOW':
    default:
      return <Badge variant="secondary">Low</Badge>;
  }
}

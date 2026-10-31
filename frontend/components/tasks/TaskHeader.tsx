'use client';

import { Plus, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store';
import { openCreateModal } from '@/store/taskSlice';

export function TaskHeader() {
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none">
          <CheckSquare className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">TaskFlow</h1>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              v0.1
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Project and task management for small agile teams
          </p>
        </div>
      </div>

      <Button
        onClick={() => dispatch(openCreateModal())}
        className="gap-2 shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Create Task
      </Button>
    </div>
  );
}

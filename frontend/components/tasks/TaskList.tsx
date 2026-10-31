'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTasks, openCreateModal } from '@/store/taskSlice';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { AlertCircle, ClipboardList, Loader2, Plus } from 'lucide-react';

export function TaskList() {
  const dispatch = useAppDispatch();
  const { items, status, error, filters } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  if (status === 'loading' && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium">Loading tasks from backend...</p>
      </div>
    );
  }

  if (status === 'failed' && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <h3 className="text-base font-semibold text-red-800 dark:text-red-300">Unable to load tasks</h3>
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 max-w-md">
          {error || 'Make sure the backend DRF service is running on http://localhost:8000.'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(fetchTasks())}
          className="mt-4 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300"
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    const isFiltered =
      filters.search !== '' || filters.status !== 'ALL' || filters.priority !== 'ALL';

    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 mb-4">
          <ClipboardList className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {isFiltered ? 'No matching tasks found' : 'No tasks yet'}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          {isFiltered
            ? 'Try adjusting your search terms or filters to find what you are looking for.'
            : 'Get started by creating your first task for your team.'}
        </p>
        {!isFiltered && (
          <Button
            onClick={() => dispatch(openCreateModal())}
            size="sm"
            className="mt-5 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

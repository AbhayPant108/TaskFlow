'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/store';
import { closeFormModal, createTask, updateTask } from '@/store/taskSlice';
import { taskSchema, TaskFormValues } from '@/schemas/taskSchema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export function TaskFormDialog() {
  const dispatch = useAppDispatch();
  const { isFormOpen, selectedTask, mutationStatus } = useAppSelector((state) => state.tasks);
  const isEditing = Boolean(selectedTask);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      due_date: null,
    },
  });

  // When dialog opens or selectedTask changes, populate or reset form
  useEffect(() => {
    if (isFormOpen) {
      if (selectedTask) {
        reset({
          title: selectedTask.title,
          description: selectedTask.description || '',
          status: selectedTask.status,
          priority: selectedTask.priority,
          due_date: selectedTask.due_date
            ? new Date(selectedTask.due_date).toISOString().slice(0, 16)
            : null,
        });
      } else {
        reset({
          title: '',
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
          due_date: null,
        });
      }
    }
  }, [isFormOpen, selectedTask, reset]);

  const onSubmit = async (values: TaskFormValues) => {
    if (isEditing && selectedTask) {
      await dispatch(updateTask({ id: selectedTask.id, data: values })).unwrap();
    } else {
      await dispatch(createTask(values)).unwrap();
    }
  };

  const isPending = mutationStatus === 'loading' || isSubmitting;

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && dispatch(closeFormModal())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update task details. Read-only fields cannot be altered.'
              : 'Add a new task to your team workflow.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Task Title <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('title')}
              placeholder="e.g. Implement authentication flow"
              className={errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.title && (
              <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Textarea
              {...register('description')}
              placeholder="Add details, acceptance criteria, or notes..."
              rows={3}
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full h-9 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              {errors.status && (
                <p className="text-xs text-red-500">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full h-9 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              {errors.priority && (
                <p className="text-xs text-red-500">{errors.priority.message}</p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Due Date & Time (Optional)
            </label>
            <Input
              type="datetime-local"
              {...register('due_date')}
              className="text-sm"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(closeFormModal())}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

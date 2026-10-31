'use client';

import { RootState, useAppDispatch, useAppSelector } from '@/store';
import { closeDeleteModal, deleteTask } from '@/store/taskSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

export function TaskDeleteDialog() {
  const dispatch = useAppDispatch();
  const { isDeleteOpen, taskToDelete, mutationStatus } = useAppSelector((state:RootState) => state.tasks);

  const handleDelete = async () => {
    if (taskToDelete) {
      await dispatch(deleteTask(taskToDelete.id));
    }
  };

  const isPending = mutationStatus === 'loading';

  return (
    <Dialog open={isDeleteOpen} onOpenChange={(open) => !open && dispatch(closeDeleteModal())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto sm:mx-0 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 mb-2">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              &quot;{taskToDelete?.title}&quot;
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="outline"
            onClick={() => dispatch(closeDeleteModal())}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

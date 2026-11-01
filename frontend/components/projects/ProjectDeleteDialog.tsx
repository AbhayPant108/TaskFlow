'use client';

import { useProjects } from '@/hooks/useProjects';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';

export function ProjectDeleteDialog() {
  const { isDeleteOpen, projectToDelete, closeDeleteDialog, removeProject, mutationStatus } =
    useProjects();

  if (!projectToDelete) return null;

  const handleDelete = async () => {
    try {
      await removeProject(projectToDelete.id);
    } catch {
      // error handled in slice
    }
  };

  const isPending = mutationStatus === 'loading';

  return (
    <Dialog open={isDeleteOpen} onOpenChange={(open) => !open && closeDeleteDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Delete Project</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to delete <strong>{projectToDelete.name}</strong>?
            All associated tasks and member records will be permanently removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={closeDeleteDialog}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

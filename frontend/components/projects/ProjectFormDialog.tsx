'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProjects } from '@/hooks/useProjects';
import { projectSchema, ProjectFormValues } from '@/schemas/projectSchema';
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
import { Loader2, Palette } from 'lucide-react';

const COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

export function ProjectFormDialog() {
  const { isFormOpen, selectedProject, closeForm, saveProject, mutationStatus, error } =
    useProjects();
  const isEditing = Boolean(selectedProject);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE' as const,
      color: '#3B82F6',
      start_date: null as string | null,
      end_date: null as string | null,
    },
  });

  const currentColor = watch('color') || '#3B82F6';

  useEffect(() => {
    if (isFormOpen) {
      if (selectedProject) {
        reset({
          name: selectedProject.name,
          description: selectedProject.description || '',
          status: selectedProject.status,
          color: selectedProject.color || '#3B82F6',
          start_date: selectedProject.start_date || null,
          end_date: selectedProject.end_date || null,
        });
      } else {
        reset({
          name: '',
          description: '',
          status: 'ACTIVE',
          color: '#3B82F6',
          start_date: null,
          end_date: null,
        });
      }
    }
  }, [isFormOpen, selectedProject, reset]);

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      await saveProject(values, selectedProject?.id);
    } catch {
      // Handled in redux
    }
  };

  const isPending = mutationStatus === 'loading' || isSubmitting;

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="h-3.5 w-3.5 rounded-full inline-block"
              style={{ backgroundColor: currentColor }}
            />
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update project details, timelines, and visual theme.'
              : 'Set up a new workspace for your team and tasks.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-600 border border-red-200 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Project Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('name')}
              placeholder="e.g. Website Redesign"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Textarea
              {...register('description')}
              placeholder="What are the goals and deliverables of this project?"
              rows={3}
            />
          </div>

          {/* Color Picker & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Palette className="h-3.5 w-3.5" /> Project Color Theme
              </label>
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PRESETS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setValue('color', hex)}
                      className={`h-6 w-6 rounded-full transition-transform cursor-pointer ${
                        currentColor.toLowerCase() === hex.toLowerCase()
                          ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                {...register('status')}
                className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <Input
                type="date"
                {...register('start_date')}
                className={errors.start_date ? 'border-red-500' : ''}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Target End Date
              </label>
              <Input
                type="date"
                {...register('end_date')}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && (
                <p className="text-xs text-red-500">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeForm}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEditing ? 'Save Changes' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

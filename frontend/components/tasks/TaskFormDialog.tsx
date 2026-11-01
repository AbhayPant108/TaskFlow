'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/store';
import { closeFormModal, createTask, updateTask } from '@/store/taskSlice';
import { fetchProjects } from '@/store/projectSlice';
import { fetchUsers } from '@/store/userSlice';
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
import { Loader2, Calendar, User, FolderKanban } from 'lucide-react';

export function TaskFormDialog() {
  const dispatch = useAppDispatch();
  const { isFormOpen, selectedTask, mutationStatus, error } = useAppSelector(
    (state) => state.tasks
  );
  const { items: projects } = useAppSelector((state) => state.projects);
  const { items: allUsers } = useAppSelector((state) => state.users);
  const { activeProject } = useAppSelector((state) => state.projects);

  const isEditing = Boolean(selectedTask);

  const defaultProjectId = selectedTask?.project || activeProject?.id || (projects[0]?.id ?? 1);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      project: defaultProjectId,
      assigned_to_id: null as number | null,
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      due_date: null as string | null,
    },
  });

  const selectedProjectId = watch('project');

  // Load projects and users if not loaded
  useEffect(() => {
    if (isFormOpen) {
      if (projects.length === 0) dispatch(fetchProjects());
      if (allUsers.length === 0) dispatch(fetchUsers());
    }
  }, [isFormOpen, dispatch, projects.length, allUsers.length]);

  // Reset or fill form
  useEffect(() => {
    if (isFormOpen) {
      if (selectedTask) {
        reset({
          title: selectedTask.title,
          description: selectedTask.description || '',
          project: selectedTask.project,
          assigned_to_id: selectedTask.assigned_to ? selectedTask.assigned_to.id : null,
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
          project: activeProject?.id || (projects[0]?.id ?? 1),
          assigned_to_id: null,
          status: 'TODO',
          priority: 'MEDIUM',
          due_date: null,
        });
      }
    }
  }, [isFormOpen, selectedTask, activeProject, projects, reset]);

  // Current project selected
  const chosenProject = useMemo(() => {
    return projects.find((p) => p.id === Number(selectedProjectId));
  }, [projects, selectedProjectId]);

  // Eligible assignees (Project owner + project members, or fallback to all users if members not yet loaded)
  const eligibleAssignees = useMemo(() => {
    if (chosenProject?.memberships && chosenProject.memberships.length > 0) {
      const list = chosenProject.memberships.map((m) => m.user);
      if (chosenProject.owner && !list.some((u) => u.id === chosenProject.owner.id)) {
        list.unshift(chosenProject.owner);
      }
      return list;
    }
    return allUsers;
  }, [chosenProject, allUsers]);

  const onSubmit = async (values: TaskFormValues) => {
    // Ensure numerical project & assigned_to_id
    const payload = {
      ...values,
      project: Number(values.project),
      assigned_to_id: values.assigned_to_id ? Number(values.assigned_to_id) : null,
    };

    if (isEditing && selectedTask) {
      await dispatch(updateTask({ id: selectedTask.id, data: payload })).unwrap();
    } else {
      await dispatch(createTask(payload)).unwrap();
    }
  };

  const isPending = mutationStatus === 'loading' || isSubmitting;

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => !open && dispatch(closeFormModal())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update task properties, assignee, and milestones.'
              : 'Add a new task bound to a project and assigned team member.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-600 border border-red-200 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Task Title <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('title')}
              placeholder="e.g. Implement authentication endpoints"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Project & Assignee Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Project (Required) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <FolderKanban className="h-3.5 w-3.5 text-indigo-600" />
                Project <span className="text-red-500">*</span>
              </label>
              <select
                {...register('project', { valueAsNumber: true })}
                className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.project && (
                <p className="text-xs text-red-500">{errors.project.message}</p>
              )}
            </div>

            {/* Assignee (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-indigo-600" />
                Assignee
              </label>
              <select
                {...register('assigned_to_id', {
                  setValueAs: (v) => (v === '' || v === 'none' ? null : Number(v)),
                })}
                className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 cursor-pointer"
              >
                <option value="none">Unassigned</option>
                {eligibleAssignees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || u.email} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                {...register('status')}
                className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 cursor-pointer"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                {...register('priority')}
                className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Due Date & Time
            </label>
            <Input
              type="datetime-local"
              {...register('due_date')}
              className={errors.due_date ? 'border-red-500' : ''}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Textarea
              {...register('description')}
              placeholder="Add details, acceptance criteria, or technical specs..."
              rows={3}
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

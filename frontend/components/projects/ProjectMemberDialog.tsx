'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProjects } from '@/hooks/useProjects';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchUsers } from '@/store/userSlice';
import { projectMemberSchema, ProjectMemberFormValues } from '@/schemas/projectSchema';
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
import { Avatar } from '@/components/ui/avatar';
import { Loader2, UserPlus, Shield, Eye, UserCheck } from 'lucide-react';

export function ProjectMemberDialog() {
  const dispatch = useAppDispatch();
  const { isMemberModalOpen, closeMemberDialog, activeProject, addMember } = useProjects();
  const { items: allUsers } = useAppSelector((state) => state.users);

  const [mode, setMode] = useState<'select' | 'email'>('select');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectMemberSchema),
    defaultValues: {
      role: 'MEMBER' as const,
      email: '',
      user_id: undefined as number | undefined,
    },
  });

  const selectedUserId = watch('user_id');

  useEffect(() => {
    if (isMemberModalOpen) {
      dispatch(fetchUsers());
      reset({ role: 'MEMBER', email: '', user_id: undefined });
      setErrorMessage(null);
      setMode('select');
    }
  }, [isMemberModalOpen, dispatch, reset]);

  // Filter out users who are already owner or members of this project
  const existingMemberIds = new Set([
    activeProject?.owner?.id,
    ...(activeProject?.memberships?.map((m) => m.user?.id) || []),
  ]);

  const candidateUsers = allUsers.filter((u) => !existingMemberIds.has(u.id));

  const onSubmit = async (values: ProjectMemberFormValues) => {
    if (!activeProject) return;
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await addMember(activeProject.id, {
        user_id: values.user_id,
        email: values.email || undefined,
        role: values.role as any,
      });
      closeMemberDialog();
    } catch (err: any) {
      setErrorMessage(err || 'Failed to add member to project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeProject) return null;

  return (
    <Dialog open={isMemberModalOpen} onOpenChange={(open) => !open && closeMemberDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" /> Add Team Member
          </DialogTitle>
          <DialogDescription>
            Invite a teammate to collaborate on <strong>{activeProject.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-600 border border-red-200 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode('select');
                setValue('email', '');
              }}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                mode === 'select'
                  ? 'bg-white shadow text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Select Team Member
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('email');
                setValue('user_id', undefined);
              }}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                mode === 'email'
                  ? 'bg-white shadow text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Invite by Email
            </button>
          </div>

          {mode === 'select' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Choose Member
              </label>
              {candidateUsers.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-500 dark:border-gray-700">
                  All active team members are already part of this project.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-200 rounded-lg p-1.5 dark:border-gray-800">
                  {candidateUsers.map((u) => {
                    const isSelected = selectedUserId === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setValue('user_id', u.id)}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-xs ${
                          isSelected
                            ? 'bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar src={u.avatar} fallback={u.full_name || u.email} size="sm" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {u.full_name || u.email}
                            </p>
                            <p className="text-[11px] text-gray-500">{u.email}</p>
                          </div>
                        </div>
                        {isSelected && <UserCheck className="h-4 w-4 text-indigo-600" />}
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Member Email Address
              </label>
              <Input
                type="email"
                placeholder="colleague@taskflow.dev"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Project Access Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border cursor-pointer text-center text-xs transition-colors ${
                  watch('role') === 'MEMBER'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500 font-semibold text-indigo-900 dark:text-indigo-200'
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  value="MEMBER"
                  {...register('role')}
                  className="sr-only"
                />
                <UserCheck className="h-4 w-4 mb-1 text-indigo-600" />
                <span>Member</span>
                <span className="text-[10px] text-gray-500 font-normal">Can create & edit tasks</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border cursor-pointer text-center text-xs transition-colors ${
                  watch('role') === 'ADMIN'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500 font-semibold text-indigo-900 dark:text-indigo-200'
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  value="ADMIN"
                  {...register('role')}
                  className="sr-only"
                />
                <Shield className="h-4 w-4 mb-1 text-purple-600" />
                <span>Admin</span>
                <span className="text-[10px] text-gray-500 font-normal">Full project management</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border cursor-pointer text-center text-xs transition-colors ${
                  watch('role') === 'VIEWER'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500 font-semibold text-indigo-900 dark:text-indigo-200'
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  value="VIEWER"
                  {...register('role')}
                  className="sr-only"
                />
                <Eye className="h-4 w-4 mb-1 text-gray-500" />
                <span>Viewer</span>
                <span className="text-[10px] text-gray-500 font-normal">Read-only view</span>
              </label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeMemberDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add to Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

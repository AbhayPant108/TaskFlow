'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types/user';
import {
  profileSchema,
  changePasswordSchema,
  ProfileFormValues,
  ChangePasswordFormValues,
} from '@/schemas/authSchema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Loader2, KeyRound, User, CheckCircle2 } from 'lucide-react';

export function ProfileDialog() {
  const { user, isProfileModalOpen, closeProfile, editProfile, updatePassword } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile Form
  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      bio: '',
      avatar: '',
    },
  });

  // Password Form
  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      new_password_confirm: '',
    },
  });

  useEffect(() => {
    if (user && isProfileModalOpen) {
      resetProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: (user as UserProfile).bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user, isProfileModalOpen, resetProfile]);

  const onSaveProfile = async (values: ProfileFormValues) => {
    try {
      setSuccessMessage(null);
      setErrorMessage(null);
      await editProfile(values);
      setSuccessMessage('Profile updated successfully!');
    } catch (err: any) {
      setErrorMessage(err || 'Failed to update profile.');
    }
  };

  const onSavePassword = async (values: ChangePasswordFormValues) => {
    try {
      setSuccessMessage(null);
      setErrorMessage(null);
      await updatePassword(values);
      resetPassword();
      setSuccessMessage('Password changed successfully!');
    } catch (err: any) {
      setErrorMessage(err || 'Failed to update password.');
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isProfileModalOpen} onOpenChange={(open) => !open && closeProfile()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar
              src={user.avatar}
              fallback={user.full_name || user.email}
              size="lg"
            />
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                {user.full_name || user.email}
                <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                  {user.role}
                </Badge>
              </DialogTitle>
              <DialogDescription>{user.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {successMessage && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-2.5 text-xs text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-700 border border-red-200 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> Profile Info
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-1.5">
              <KeyRound className="h-4 w-4" /> Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <Input
                    {...regProfile('first_name')}
                    placeholder="First name"
                  />
                  {profileErrors.first_name && (
                    <p className="text-xs text-red-500">{profileErrors.first_name.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <Input
                    {...regProfile('last_name')}
                    placeholder="Last name"
                  />
                  {profileErrors.last_name && (
                    <p className="text-xs text-red-500">{profileErrors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Avatar Image URL
                </label>
                <Input
                  {...regProfile('avatar')}
                  placeholder="https://example.com/avatar.jpg"
                />
                {profileErrors.avatar && (
                  <p className="text-xs text-red-500">{profileErrors.avatar.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Bio / Role Summary
                </label>
                <Textarea
                  {...regProfile('bio')}
                  placeholder="A short note about your responsibilities or interests..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isProfileSubmitting}
              >
                {isProfileSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="password">
            <form onSubmit={handlePasswordSubmit(onSavePassword)} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...regPassword('old_password')}
                />
                {passwordErrors.old_password && (
                  <p className="text-xs text-red-500">{passwordErrors.old_password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...regPassword('new_password')}
                />
                {passwordErrors.new_password && (
                  <p className="text-xs text-red-500">{passwordErrors.new_password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...regPassword('new_password_confirm')}
                />
                {passwordErrors.new_password_confirm && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.new_password_confirm.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isPasswordSubmitting}
              >
                {isPasswordSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Update Password
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

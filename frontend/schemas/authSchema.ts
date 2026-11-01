import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address'),
    first_name: z.string().trim().min(1, 'First name is required').max(150),
    last_name: z.string().trim().min(1, 'Last name is required').max(150),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128),
    password_confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  first_name: z.string().trim().max(150),
  last_name: z.string().trim().max(150),
  bio: z.string().max(1000).optional(),
  avatar: z.string().trim().url('Must be a valid URL').or(z.literal('')).optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'New password must be at least 8 characters'),
    new_password_confirm: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: 'New passwords do not match',
    path: ['new_password_confirm'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

import { z } from 'zod';

export const projectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Project name is required')
      .max(200, 'Name must be 200 characters or fewer'),
    description: z.string().optional(),
    status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
    color: z
      .string()
      .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Color must be a valid hex code (e.g. #3B82F6)'),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.start_date) <= new Date(data.end_date);
      }
      return true;
    },
    {
      message: 'End date cannot be earlier than start date',
      path: ['end_date'],
    }
  );

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const projectMemberSchema = z
  .object({
    user_id: z.number().optional(),
    email: z.string().trim().email('Please enter a valid email').optional().or(z.literal('')),
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
  })
  .refine((data) => data.user_id !== undefined || (data.email && data.email.length > 0), {
    message: 'Please select a team member or enter an email address',
    path: ['email'],
  });

export type ProjectMemberFormValues = z.infer<typeof projectMemberSchema>;

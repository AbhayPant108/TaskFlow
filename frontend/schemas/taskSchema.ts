import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(255, 'Title must be 255 characters or fewer'),
  description: z.string(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  due_date: z.string().nullable().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

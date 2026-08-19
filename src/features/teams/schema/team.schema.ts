import { z } from 'zod';

export const teamSchema = z.object({
  teamName: z
    .string({ message: 'Team name is required' })
    .trim()
    .min(1, 'Team name is required')
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name cannot exceed 100 characters'),
  teamCode: z
    .string({ message: 'Team code is required' })
    .trim()
    .min(1, 'Team code is required')
    .min(2, 'Team code must be at least 2 characters')
    .max(15, 'Team code cannot exceed 15 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Team code must be alphanumeric (letters and numbers only)'),
  schoolId: z.string().min(1, 'School is required'),
});

export type TeamFormData = z.infer<typeof teamSchema>;

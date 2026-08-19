import { z } from 'zod';

export const schoolSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters').max(150, 'School name must be at most 150 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(300, 'Address must be at most 300 characters'),
});

export type SchoolFormData = z.infer<typeof schoolSchema>;

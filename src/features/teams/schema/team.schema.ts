import { z } from 'zod';

// Mirrors the backend validator: name is all a team has, and it must be unique
// among live teams (case-insensitively) — that part is enforced server-side.
export const teamSchema = z.object({
  name: z
    .string({ message: 'Team name is required' })
    .trim()
    .min(1, 'Team name is required')
    .max(100, 'Team name cannot exceed 100 characters'),
});

export type TeamFormData = z.infer<typeof teamSchema>;

import { z } from 'zod';

// Mirrors the backend validator: name is all a team has, and it must be unique
// among live teams (case-insensitively) — that part is enforced server-side.
export const teamSchema = z.object({
  name: z
    .string({ message: 'Team name is required' })
    .trim()
    .min(1, 'Team name is required')
    .max(50, 'Team name cannot exceed 50 characters')
    .regex(
      /^[a-zA-Z0-9'.-]+(?: [a-zA-Z0-9'.-]+)*$/,
      'Team name can only contain letters, numbers, hyphens, periods, and apostrophes',
    ),
});

export type TeamFormData = z.infer<typeof teamSchema>;

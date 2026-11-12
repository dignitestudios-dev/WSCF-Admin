import { z } from 'zod';

// Mirrors the backend validator. The code is the team's identifier in WinTD and
// is required; the name is optional (blank means "no name"). Uniqueness of both
// is enforced server-side.
export const teamSchema = z.object({
  code: z
    .string({ message: 'Team code is required' })
    .trim()
    .regex(/^[A-Za-z0-9]{6}$/, 'Team code must be exactly 6 letters or digits'),
  name: z
    .string()
    .trim()
    .max(50, 'Team name cannot exceed 50 characters')
    .refine(
      (value) => value === '' || /^[a-zA-Z0-9'.-]+(?: [a-zA-Z0-9'.-]+)*$/.test(value),
      'Team name can only contain letters, numbers, hyphens, periods, and apostrophes',
    ),
});

export type TeamFormData = z.infer<typeof teamSchema>;

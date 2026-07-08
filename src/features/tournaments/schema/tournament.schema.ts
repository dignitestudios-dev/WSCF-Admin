import { z } from 'zod';

export const tournamentSchema = z.object({
  title: z.string().min(3, 'Tournament title must be at least 3 characters'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(2, 'Location is required'),
  entryFee: z.string().optional(),
  isFree: z.boolean(),
  director: z.string().min(2, 'Tournament director is required'),
  host: z.string().min(2, 'Tournament host is required'),
  divisions: z.array(z.string()).optional(),
});

export type TournamentFormData = z.infer<typeof tournamentSchema>;

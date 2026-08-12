import { z } from 'zod';

export const tournamentSchema = z.object({
  title: z.string().min(3, 'Tournament title must be at least 3 characters').max(100, 'Tournament title must be at most 100 characters'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(2, 'Location is required').max(100, 'Location must be at most 100 characters'),
  entryFee: z.string().max(10, 'Entry fee is too large').optional(),
  isFree: z.boolean(),
  director: z.string().min(2, 'Tournament director is required').max(100, 'Tournament director must be at most 100 characters'),
  host: z.string().min(2, 'Tournament host is required').max(100, 'Tournament host must be at most 100 characters'),
  divisions: z.array(z.string()).optional(),
});

export type TournamentFormData = z.infer<typeof tournamentSchema>;

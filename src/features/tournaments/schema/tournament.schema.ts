import { z } from 'zod';

export const tournamentSchema = z.object({
  title: z.string().min(3, 'Tournament title must be at least 3 characters').max(100, 'Tournament title must be at most 100 characters'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(2, 'Location is required').max(100, 'Location must be at most 100 characters'),
  entryFee: z.string().min(1, 'Entry fee is required').refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Entry fee must be greater than 0'),
  director: z.string().min(2, 'Tournament director is required').max(100, 'Tournament director must be at most 100 characters'),
  host: z.string().min(2, 'Tournament host is required').max(100, 'Tournament host must be at most 100 characters'),
  divisions: z.array(z.object({
    type: z.enum(['open', 'conditional']),
    divisionType: z.string().optional(),
    rating: z.number().or(z.nan()).optional(),
    condition: z.enum(['under', 'over']).optional(),
    divisionName: z.string().optional()
  }).superRefine((data, ctx) => {
    if (data.type === 'conditional') {
      if (!data.divisionType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['divisionType'],
          message: 'Division type is required',
        });
      } else if (data.divisionType.length > 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['divisionType'],
          message: 'Max 20 characters',
        });
      }

      if (!data.condition) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['condition'],
          message: 'Condition is required',
        });
      }

      if (data.rating === undefined || Number.isNaN(data.rating)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rating'],
          message: 'Rating limit is required',
        });
      } else if (data.rating < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rating'],
          message: 'Rating cannot be negative',
        });
      } else if (data.rating > 10000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rating'],
          message: 'Max rating is 10000',
        });
      }
    }
  }))
  .min(1, 'At least one division is required')
  .superRefine((divisions, ctx) => {
    let openCount = 0;
    const conditionalNames = new Set<string>();

    divisions.forEach((d, index) => {
      if (d.type === 'open') {
        openCount++;
        if (openCount > 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Only one Open division is allowed',
            path: [index, 'type'],
          });
        }
      } else if (d.type === 'conditional' && d.divisionType && d.condition && d.rating !== undefined && !Number.isNaN(d.rating)) {
        const name = `${d.divisionType} ${d.condition === 'over' ? 'O' : 'U'} ${d.rating}`;
        if (conditionalNames.has(name)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'This conditional division already exists',
            path: [index, 'divisionType'],
          });
        }
        conditionalNames.add(name);
      }
    });
  }),
});

export type TournamentFormData = z.infer<typeof tournamentSchema>;

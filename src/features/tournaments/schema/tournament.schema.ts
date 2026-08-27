import { z } from 'zod';

/**
 * A division is a name the admin types, a span of grades, and an optional
 * rating bound. There is no division "type" any more — a division spanning
 * K–12 with no rating is the open section.
 *
 * Grades are picked in one control, the way a date picker takes either a single
 * date or a range: one grade sets both ends, a second widens the span. So a
 * single grade is simply gradeMin === gradeMax, with no mode to track.
 */
export const divisionSchema = z.object({
  _id: z.string().optional(),
  name: z.string().trim().min(1, 'Division name is required').max(40, 'Max 40 characters'),
  gradeMin: z.number().int().min(0).max(12).or(z.nan()).optional(),
  gradeMax: z.number().int().min(0).max(12).or(z.nan()).optional(),
  rating: z.number().or(z.nan()).optional(),
  // The UI says "Over", the API says "above"; tournament-form.tsx translates.
  condition: z.enum(['under', 'over']).optional(),
}).superRefine((data, ctx) => {
  const hasMin = data.gradeMin !== undefined && !Number.isNaN(data.gradeMin);
  const hasMax = data.gradeMax !== undefined && !Number.isNaN(data.gradeMax);

  // The picker always writes both ends together, so either both are set or
  // nothing has been chosen yet.
  if (!hasMin || !hasMax) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['gradeMin'],
      message: 'Grade is required',
    });
  } else if ((data.gradeMax as number) < (data.gradeMin as number)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['gradeMin'],
      message: 'Grade range must end at or after it starts',
    });
  }

  // Rating is optional. Once it is set it needs a direction, or the division
  // silently admits everyone instead of the group that was meant.
  const hasRating = data.rating !== undefined && !Number.isNaN(data.rating);
  if (hasRating) {
    if ((data.rating as number) < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rating'],
        message: 'Rating cannot be negative',
      });
    } else if ((data.rating as number) > 10000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rating'],
        message: 'Max rating is 10000',
      });
    }

    if (!data.condition) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['condition'],
        message: 'Choose Under or Over',
      });
    }
  }
});

export const tournamentSchema = z.object({
  title: z.string().min(3, 'Tournament title must be at least 3 characters').max(100, 'Tournament title must be at most 100 characters'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(2, 'Location is required').max(100, 'Location must be at most 100 characters'),
  entryFee: z.string().min(1, 'Entry fee is required').refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Entry fee must be greater than 0'),
  divisions: z.array(divisionSchema)
    .min(1, 'At least one division is required')
    .superRefine((divisions, ctx) => {
      // Names are free text now, so they are what a duplicate is measured by.
      // Two divisions differing only in case would be indistinguishable to a
      // parent reading the registration screen.
      const seen = new Map<string, number>();

      divisions.forEach((d, index) => {
        const key = (d.name || '').trim().toLowerCase();
        if (!key) return;

        if (seen.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'A division with this name already exists',
            path: [index, 'name'],
          });
        } else {
          seen.set(key, index);
        }
      });
    }),
});

export type TournamentFormData = z.infer<typeof tournamentSchema>;
export type DivisionFormData = z.infer<typeof divisionSchema>;

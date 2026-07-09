import { z } from 'zod';

export const verifyOtpSchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d+$/, 'Verification code must contain only numbers'),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

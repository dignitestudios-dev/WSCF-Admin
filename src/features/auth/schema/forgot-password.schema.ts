import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email cannot exceed 254 characters'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

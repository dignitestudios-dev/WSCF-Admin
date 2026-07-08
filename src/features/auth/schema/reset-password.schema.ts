import { z } from 'zod';

export const resetPasswordSchema = z.object({
  password: z
    .string({ message: 'Password is required' })
    .trim()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password cannot exceed 50 characters'),
  confirmPassword: z
    .string({ message: 'Confirm password is required' })
    .trim()
    .min(1, 'Confirm password is required')
    .min(8, 'Confirm password must be at least 8 characters')
    .max(50, 'Confirm password cannot exceed 50 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

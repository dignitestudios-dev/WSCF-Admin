import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email cannot exceed 254 characters'),
  password: z
    .string({ message: 'Password is required' })
    .trim()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password cannot exceed 50 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

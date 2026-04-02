import { z } from 'zod';

export const signInSchema = z
  .object({
    email: z.email('Invalid email address'),
    password: z
      .string('Password must be provided')
      .min(8, 'Password must be at least 8 characters long'),
    role: z.enum(['seller', 'user'], 'Role must be either seller or user'),
  })
  .strip();

export type signInDto = z.infer<typeof signInSchema>;

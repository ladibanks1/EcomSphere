import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const signInSchema = z
  .object({
    email: z.email('Invalid email address'),
    password: z
      .string('Password must be provided')
      .min(8, 'Password must be at least 8 characters long'),
    role: z.enum(['seller', 'user'], 'Role must be either seller or user'),
  })
  .strip();

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z
    .string('Password must be provided')
    .min(8, 'Password must be at least 8 characters long'),
});

export class signInDto extends createZodDto(signInSchema) {}
export  class  loginDto extends createZodDto(loginSchema) {}

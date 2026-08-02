import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const otpSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
});

export class sendOtpDto extends createZodDto(otpSchema.omit({ otp: true })) {}
export class verifyOtpDto extends createZodDto(otpSchema) {}
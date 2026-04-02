import { z } from 'zod';

export const sendOtpSchema = z.object({ email: z.email() });

export type sendOtpDto = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({ email: z.email(), otp: z.string() });
export type verifyOtpDto = z.infer<typeof verifyOtpSchema>;

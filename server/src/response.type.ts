import z from 'zod';
import { createZodDto } from 'nestjs-zod';

const successResponse = z.object({
  message: z.string(),
  success: z.boolean(),
});

export class SuccessResponseSchema extends createZodDto(successResponse) {}

import { BadRequestException } from '@nestjs/common';
import { ZodError, z } from 'zod';
import { createZodValidationPipe } from 'nestjs-zod';

export const ZodPipe = createZodValidationPipe({
  createValidationException(e) {
    if (!(e instanceof ZodError)) {
      console.log(e);
      throw e;
    }
    const error = z.flattenError(e);
    console.log(error);
    if (Object.keys(error.fieldErrors).length > 0) {
      throw new BadRequestException({
        success: false,
        message: 'Validation Failed',
        errors: error.fieldErrors,
      });
    }
    throw new BadRequestException({
      success: false,
      message: 'Validation Failed',
      errors: {
        form: error.formErrors,
      },
    });
  },
});

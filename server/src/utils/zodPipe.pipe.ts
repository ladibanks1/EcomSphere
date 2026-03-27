import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodError, ZodType, z } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (e) {
      if (e instanceof ZodError) {
        const error = z.flattenError(e);

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
      }

      // VERY IMPORTANT
      throw e;
    }
  }
}

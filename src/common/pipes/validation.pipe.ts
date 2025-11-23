/**
 * Validation Pipe
 * Validasi DTO menggunakan class-validator
 */

import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

interface FormattedError {
  field: string;
  constraints: Record<string, string>;
  children?: FormattedError[];
}

type ValidatorType = new (...args: unknown[]) => unknown;

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value as object) as object;
    const errors = await validate(object);

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        message: 'Validasi gagal',
        errors: formattedErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: ValidatorType): boolean {
    const types: ValidatorType[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): FormattedError[] {
    return errors.map((error) => ({
      field: error.property,
      constraints: error.constraints || {},
      children:
        error.children && error.children.length > 0
          ? this.formatErrors(error.children)
          : undefined,
    }));
  }
}

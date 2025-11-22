/**
 * DTO untuk update user
 */

import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'email', 'role'] as const),
) {
  @ApiPropertyOptional({
    description: 'Status aktif user',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive harus berupa boolean' })
  isActive?: boolean;
}

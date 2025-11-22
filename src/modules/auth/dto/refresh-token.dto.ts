/**
 * DTO untuk refresh token
 */

import { IsNotEmpty, IsString, IsJWT } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token yang valid',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Refresh token harus diisi' })
  @IsString({ message: 'Refresh token harus berupa string' })
  @IsJWT({ message: 'Format refresh token tidak valid' })
  refreshToken: string;
}

/**
 * DTO untuk response authentication
 */

import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Token expiry time in seconds',
    example: 604800,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Data user yang login',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}

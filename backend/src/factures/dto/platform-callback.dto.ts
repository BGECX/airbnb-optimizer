import { IsDateString, IsEnum, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PlatformCallbackStatus {
  ACCEPTEE = 'ACCEPTEE',
  REJETEE = 'REJETEE',
  ERREUR = 'ERREUR',
}

export class PlatformCallbackDto {
  @ApiProperty() @IsString() @MinLength(1) externalId: string;
  @ApiProperty({ enum: PlatformCallbackStatus }) @IsEnum(PlatformCallbackStatus) status: PlatformCallbackStatus;
  @ApiProperty() @IsDateString() occurredAt: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() details?: Record<string, unknown>;
}

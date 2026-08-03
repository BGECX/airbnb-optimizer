import { IsEnum, IsHash, IsObject, IsString, IsOptional, IsUUID, IsNumber, IsUrl, Matches, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhotoPhase } from '@prisma/client';

export class CreatePhotoDto {
  @ApiProperty()
  @IsUUID()
  chantierId: string;

  @ApiProperty()
  @IsString()
  @IsUrl({ require_tld: false })
  @Matches(/^https?:\/\//i, { message: 'url doit utiliser HTTP ou HTTPS' })
  @MaxLength(2048)
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\//i, { message: 'thumbnailUrl doit utiliser HTTP ou HTTPS' })
  @MaxLength(2048)
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lieu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString() @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-90) @Max(90)
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-180) @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ enum: PhotoPhase }) @IsOptional() @IsEnum(PhotoPhase) phase?: PhotoPhase;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) zone?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() ouvrageId?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() annotations?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsHash('sha256') hashSha256?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clientSyncId?: string;
}

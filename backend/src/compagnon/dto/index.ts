import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsHash, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUrl, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhotoPhase, PointageType, Priorite } from '@prisma/client';

export class StartPointageDto {
  @ApiProperty() @IsUUID() chantierId: string;
  @ApiProperty() @IsDateString() heureDebut: string;
  @ApiProperty() @IsUUID() clientSyncId: string;
  @ApiPropertyOptional({ enum: PointageType }) @IsOptional() @IsEnum(PointageType) type?: PointageType;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(-90) @Max(90) latitude?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(-180) @Max(180) longitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
export class StopPointageDto { @ApiProperty() @IsDateString() heureFin: string; }
export class UpdateTaskProgressDto { @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) @Max(100) avancement: number; }

export class CompanionPhotoDto {
  @ApiProperty() @IsUUID() chantierId: string;
  @ApiProperty() @IsUrl({ require_tld: false }) url: string;
  @ApiProperty() @IsUUID() clientSyncId: string;
  @ApiPropertyOptional({ enum: PhotoPhase }) @IsOptional() @IsEnum(PhotoPhase) phase?: PhotoPhase;
  @ApiPropertyOptional() @IsOptional() @IsString() zone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(-90) @Max(90) latitude?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(-180) @Max(180) longitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsObject() annotations?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsHash('sha256') hashSha256?: string;
}
export class CompanionBonDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() chantierId?: string;
  @ApiProperty() @IsString() @IsNotEmpty() objet: string;
  @ApiPropertyOptional({ enum: Priorite }) @IsOptional() @IsEnum(Priorite) priorite?: Priorite;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

import { ApporteurType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, Matches, Max, Min, MinLength } from 'class-validator';

export class CreateApporteurDto {
  @IsEnum(ApporteurType) type: ApporteurType;
  @IsString() @MinLength(1) nom: string;
  @IsOptional() @Matches(/^\d{14}$/, { message: 'Le SIRET doit contenir exactement 14 chiffres' }) siret?: string;
  @IsOptional() @IsString() adresse?: string;
  @IsOptional() @IsString() codePostal?: string;
  @IsOptional() @IsString() ville?: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() contactNom?: string;
  @IsOptional() @IsString() referenceMandat?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) commissionPct?: number;
}

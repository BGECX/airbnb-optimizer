import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DpgfStatut, PosteDpgfType } from '@prisma/client';

export class CreateDpgfDto {
  @ApiProperty() @IsUUID() chantierId: string;
  @ApiProperty() @IsString() @IsNotEmpty() nom: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(1) coefficientFraisGeneraux?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(1) coefficientMarge?: number;
}

export class CreateLotDpgfDto {
  @ApiProperty() @IsString() @IsNotEmpty() code: string;
  @ApiProperty() @IsString() @IsNotEmpty() designation: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) ordre?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() parentId?: string;
}

export class CreatePosteDpgfDto {
  @ApiProperty() @IsString() @IsNotEmpty() code: string;
  @ApiProperty() @IsString() @IsNotEmpty() designation: string;
  @ApiProperty() @IsString() @IsNotEmpty() unite: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) quantite?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) debourseUnitaire?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(1) coefficientVente?: number;
  @ApiPropertyOptional({ enum: PosteDpgfType }) @IsOptional() @IsEnum(PosteDpgfType) type?: PosteDpgfType;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isSelected?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsUUID() ouvrageId?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) ordre?: number;
}

export class CreateMetreDto {
  @ApiProperty() @IsString() @IsNotEmpty() libelle: string;
  @ApiPropertyOptional({ example: '(L*H*N)-OUVERTURES' }) @IsOptional() @IsString() formule?: string;
  @ApiPropertyOptional({ example: { L: 4.2, H: 2.5, N: 2, OUVERTURES: 3 } }) @IsOptional() @IsObject() variables?: Record<string, number>;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) quantite?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) longueur?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) largeur?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) hauteur?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(1000) coefficient?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() commentaire?: string;
}

export class SelectPosteDto {
  @ApiProperty() @IsBoolean() isSelected: boolean;
}

export class ChangeDpgfStatusDto {
  @ApiProperty({ enum: DpgfStatut }) @IsEnum(DpgfStatut) statut: DpgfStatut;
}

export class ConvertDpgfToDevisDto {
  @ApiProperty() @IsDateString() dateValidite: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) tauxTva?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() conditions?: string;
}

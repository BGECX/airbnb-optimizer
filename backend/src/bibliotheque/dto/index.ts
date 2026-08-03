import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RessourceType } from '@prisma/client';

export class ComposantOuvrageDto {
  @ApiProperty({ enum: RessourceType }) @IsEnum(RessourceType) type: RessourceType;
  @ApiProperty() @IsString() @IsNotEmpty() designation: string;
  @ApiProperty() @IsString() @IsNotEmpty() unite: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) quantite: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) prixUnitaire: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) tauxPerte?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() fournisseur?: string;
}

export class CreateOuvrageDto {
  @ApiProperty() @IsString() @IsNotEmpty() reference: string;
  @ApiProperty() @IsString() @IsNotEmpty() designation: string;
  @ApiProperty() @IsString() @IsNotEmpty() unite: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categorie?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sousCategorie?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(1) coefficientVente?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) tempsPoseHeures?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) rendement?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionTechnique?: string;
  @ApiProperty({ type: [ComposantOuvrageDto] }) @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ComposantOuvrageDto) composants: ComposantOuvrageDto[];
}

export class AddComposantDto extends ComposantOuvrageDto {}

export class UpdatePrixOuvrageDto {
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) prixAchat: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) prixVente: number;
  @ApiPropertyOptional() @IsOptional() @IsString() fournisseur?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() commentaire?: string;
}

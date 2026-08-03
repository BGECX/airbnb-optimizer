import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeclarationTvaDto {
  @ApiProperty()
  @IsString()
  periode: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  tvaCollectee: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  tvaDeductible: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  montantAPayer: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCredit?: boolean;

  @ApiProperty()
  @IsDateString()
  dateEcheance: string;
}

export class CreateEcritureDto {
  @ApiProperty()
  @IsString()
  journal: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  numeroPiece: string;

  @ApiProperty()
  @IsString()
  compte: string;

  @ApiProperty()
  @IsString()
  libelle: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  debit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  credit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lettrage?: string;
}

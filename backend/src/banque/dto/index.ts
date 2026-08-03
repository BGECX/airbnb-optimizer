import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OperationType } from '@prisma/client';

export class CreateOperationDto {
  @ApiProperty({ enum: OperationType })
  @IsEnum(OperationType)
  type: OperationType;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  libelle: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  montant: number;

  @ApiProperty()
  @IsString()
  banque: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modeReglement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  compteComptable?: string;
}

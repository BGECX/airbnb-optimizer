import { IsString, IsOptional, IsUUID, IsNumber, IsInt, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiagnosticType, DiagnosticConclusion, EvenementType, LotSituation } from '@prisma/client';
import { PartialType, OmitType } from '@nestjs/swagger';

export class CreateCoproprieteDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty()
  @IsString()
  adresse: string;

  @ApiProperty()
  @IsString()
  codePostal: string;

  @ApiProperty()
  @IsString()
  ville: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  nombreLots: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateConstruction?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  syndicNom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  syndicContact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;
}

export class CreateLotDto {
  @ApiProperty()
  @IsUUID()
  coproprieteId: string;

  @ApiProperty()
  @IsString()
  numero: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  tantiemes: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  surface?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  derniersTravaux?: string;

  @ApiPropertyOptional({ enum: LotSituation })
  @IsOptional()
  @IsEnum(LotSituation)
  pointSituation?: LotSituation;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  montantConsignation?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dpeClasse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dpeConsommation?: number;
}

export class UpdateCoproprieteDto extends PartialType(CreateCoproprieteDto) {}
export class UpdateLotDto extends PartialType(OmitType(CreateLotDto, ['coproprieteId'] as const)) {}

export class CreateDiagnosticDto {
  @ApiProperty()
  @IsUUID()
  coproprieteId: string;

  @ApiProperty({ enum: DiagnosticType })
  @IsEnum(DiagnosticType)
  type: DiagnosticType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  lotId?: string;

  @ApiProperty()
  @IsDateString()
  dateRealisation: string;

  @ApiProperty()
  @IsDateString()
  dateValidite: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnostiqueur?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  numeroAttestation?: string;

  @ApiPropertyOptional({ enum: DiagnosticConclusion })
  @IsOptional()
  @IsEnum(DiagnosticConclusion)
  conclusion?: DiagnosticConclusion;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentUrl?: string;
}

export class CreateDTGDto {
  @ApiProperty()
  @IsUUID()
  coproprieteId: string;

  @ApiProperty()
  @IsDateString()
  dateRealisation: string;

  @ApiProperty()
  @IsDateString()
  dateValidite: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnostiqueur?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentUrl?: string;
}

export class CreateEvenementDto {
  @ApiProperty()
  @IsUUID()
  coproprieteId: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ enum: EvenementType })
  @IsEnum(EvenementType)
  type: EvenementType;

  @ApiProperty()
  @IsString()
  titre: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cout?: number;
}

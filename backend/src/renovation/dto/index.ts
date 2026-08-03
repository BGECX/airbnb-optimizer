import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AleaCategorie, AleaStatut, ElementBati, GraviteDiagnostic, TraceBatiType, TravailConservatoireStatut } from '@prisma/client';

export class CreateDiagnosticBatiDto {
  @ApiProperty() @IsString() @IsNotEmpty() zone: string;
  @ApiProperty({ enum: ElementBati }) @IsEnum(ElementBati) element: ElementBati;
  @ApiPropertyOptional() @IsOptional() @IsString() materiau?: string;
  @ApiProperty() @IsString() @IsNotEmpty() pathologie: string;
  @ApiPropertyOptional({ enum: GraviteDiagnostic }) @IsOptional() @IsEnum(GraviteDiagnostic) gravite?: GraviteDiagnostic;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() urgence?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() preconisations?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() etatAvant?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() visiteId?: string;
}

export class CreateAleaDto {
  @ApiProperty({ enum: AleaCategorie }) @IsEnum(AleaCategorie) categorie: AleaCategorie;
  @ApiProperty() @IsString() @IsNotEmpty() description: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) probabilite?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) impact?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) coutEstime?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) delaiJoursEstime?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() mesures?: string;
}

export class ChangeAleaStatusDto { @ApiProperty({ enum: AleaStatut }) @IsEnum(AleaStatut) statut: AleaStatut; }

export class CreateTravailConservatoireDto {
  @ApiProperty() @IsString() @IsNotEmpty() designation: string;
  @ApiProperty() @IsString() @IsNotEmpty() motif: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() diagnosticId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() datePrevue?: string;
}
export class ChangeTravailStatusDto { @ApiProperty({ enum: TravailConservatoireStatut }) @IsEnum(TravailConservatoireStatut) statut: TravailConservatoireStatut; }

export class CreateTraceBatiDto {
  @ApiProperty({ enum: TraceBatiType }) @IsEnum(TraceBatiType) type: TraceBatiType;
  @ApiProperty() @IsString() @IsNotEmpty() zone: string;
  @ApiProperty() @IsString() @IsNotEmpty() description: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() donnees?: Record<string, unknown>;
}

import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsHash, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUrl, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategorieCout, DocumentChantierType, PhotoPhase, SourceDepense } from '@prisma/client';

export class SetBudgetDto {
  @ApiProperty({ enum: CategorieCout }) @IsEnum(CategorieCout) categorie: CategorieCout;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) montant: number;
  @ApiPropertyOptional() @IsOptional() @IsString() commentaire?: string;
}
export class CreateDepenseDto {
  @ApiProperty({ enum: CategorieCout }) @IsEnum(CategorieCout) categorie: CategorieCout;
  @ApiPropertyOptional({ enum: SourceDepense }) @IsOptional() @IsEnum(SourceDepense) source?: SourceDepense;
  @ApiProperty() @IsString() @IsNotEmpty() libelle: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0.01) montantHt: number;
  @ApiProperty() @IsDateString() date: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() commandeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() factureFournisseurId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ require_tld: false }) justificatifUrl?: string;
}
export class AssignSousTraitantDto {
  @ApiProperty() @IsUUID() sousTraitantId: string;
  @ApiProperty() @IsString() @IsNotEmpty() lot: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) montantEngageHt: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateDebut?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateFin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observations?: string;
}
export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentChantierType }) @IsEnum(DocumentChantierType) type: DocumentChantierType;
  @ApiPropertyOptional({ enum: PhotoPhase }) @IsOptional() @IsEnum(PhotoPhase) phase?: PhotoPhase;
  @ApiPropertyOptional() @IsOptional() @IsString() zone?: string;
  @ApiProperty() @IsString() @IsNotEmpty() nom: string;
  @ApiProperty() @IsUrl({ require_tld: false }) url: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mimeType?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) taille?: number;
  @ApiPropertyOptional() @IsOptional() @IsHash('sha256') hashSha256?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}

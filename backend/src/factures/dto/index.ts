import { IsString, IsOptional, IsUUID, IsNumber, IsArray, ValidateNested, IsBoolean, IsEnum, IsDateString, ArrayMinSize, Min, Max, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CanalTransmission, CategorieOperation, FactureStatut, FactureType, FormatFactureElectronique } from '@prisma/client';

class LigneFactureDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  designation: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unite?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantite: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prixUnitaireHt: number;

  @ApiPropertyOptional({ description: 'Ignoré : recalculé côté serveur' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalHt?: number;
}

export class CreateFactureDto {
  @ApiProperty()
  @IsUUID()
  clientId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  chantierId?: string;

  @ApiProperty()
  @IsEnum(FactureType)
  type: FactureType;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  objet: string;

  @ApiProperty()
  @IsDateString()
  dateEcheance: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  tauxTva?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modeReglement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isChorusPro?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsDateString() datePrestation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() adresseFacturation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() referenceAcheteur?: string;
  @ApiPropertyOptional({ enum: CategorieOperation }) @IsOptional() @IsEnum(CategorieOperation) categorieOperation?: CategorieOperation;

  @ApiProperty({ type: [LigneFactureDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LigneFactureDto)
  lignes: LigneFactureDto[];
}

export class UpdateFactureDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(FactureStatut)
  statut?: FactureStatut;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chorusProStatut?: string;
}

export class RegisterPaymentDto {
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0.01) montant: number;
  @ApiProperty() @IsDateString() date: string;
  @ApiProperty() @IsString() @MinLength(1) mode: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reference?: string;
}

export class PrepareElectronicInvoiceDto {
  @ApiPropertyOptional({ enum: FormatFactureElectronique }) @IsOptional() @IsEnum(FormatFactureElectronique) format?: FormatFactureElectronique;
  @ApiPropertyOptional({ enum: CanalTransmission }) @IsOptional() @IsEnum(CanalTransmission) canal?: CanalTransmission;
}

export class CreateAvoirDto {
  @ApiProperty() @IsString() @MinLength(3) motif: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0.01) montantHt: number;
}

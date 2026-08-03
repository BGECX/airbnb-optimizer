import { IsString, IsOptional, IsUUID, IsNumber, ValidateNested, IsArray, ArrayMinSize, IsDateString, IsEnum, Min, Max, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DevisStatut, FactureType } from '@prisma/client';

class LigneDevisDto {
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

export class CreateDevisDto {
  @ApiProperty()
  @IsUUID()
  clientId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  chantierId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  objet: string;

  @ApiProperty()
  @IsDateString()
  dateValidite: string;

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
  conditions?: string;

  @ApiProperty({ type: [LigneDevisDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LigneDevisDto)
  lignes: LigneDevisDto[];
}

export class UpdateDevisDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objet?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(DevisStatut)
  statut?: DevisStatut;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conditions?: string;
}

export class TransformDevisDto {
  @ApiProperty()
  @IsDateString()
  dateEcheance: string;

  @ApiPropertyOptional({ enum: FactureType, default: FactureType.DEFINITIVE })
  @IsOptional()
  @IsEnum(FactureType)
  type?: FactureType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modeReglement?: string;
}

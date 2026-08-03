import { IsString, IsOptional, IsUUID, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class LigneCommandeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty()
  @IsString()
  designation: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  quantite: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  prixUnitaireHt: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  totalHt: number;
}

export class CreateCommandeDto {
  @ApiProperty()
  @IsUUID()
  fournisseurId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  chantierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateLivraison?: string;

  @ApiProperty({ type: [LigneCommandeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneCommandeDto)
  lignes: LigneCommandeDto[];
}

export class CreateLivraisonDto {
  @ApiProperty()
  @IsUUID()
  commandeId: string;

  @ApiProperty()
  @IsString()
  numeroBl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateFactureFournDto {
  @ApiProperty()
  @IsUUID()
  fournisseurId: string;

  @ApiProperty()
  @IsString()
  numero: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsDateString()
  dateEcheance: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  totalHt: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  totalTva: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  totalTtc: number;
}

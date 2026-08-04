import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEmail, IsNumber, IsOptional, IsString, Matches, Max, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEntrepriseDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) raisonSociale?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() siret?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() siren?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tvaIntra?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() adresse?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() codePostal?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ville?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telephone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() siteWeb?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() couleurPrimary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() couleurSecondary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cgv?: string;
}

export class VerifyVatDto {
  @ApiProperty({ example: 'FR40303265045' })
  @IsString()
  @Matches(/^[A-Z]{2}[A-Z0-9]{2,14}$/, { message: 'Le numéro de TVA doit commencer par le code pays et contenir 4 à 16 caractères' })
  numero: string;
}

export class UpdateNumerotationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() prefixe?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() format?: string;
}

export class CreateTvaDto {
  @ApiProperty() @IsString() @MinLength(1) nom: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) @Max(100) taux: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
}

export class CreateBanqueDto {
  @ApiProperty() @IsString() @MinLength(1) nom: string;
  @ApiProperty() @IsString() @MinLength(15) iban: string;
  @ApiProperty() @IsString() @MinLength(8) bic: string;
  @ApiPropertyOptional() @IsOptional() @IsString() compteComptable?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
}

export class CreateAssuranceDto {
  @ApiProperty() @IsString() @MinLength(1) type: string;
  @ApiProperty() @IsString() @MinLength(1) police: string;
  @ApiProperty() @IsString() @MinLength(1) compagnie: string;
  @ApiProperty() @IsDateString() dateDebut: string;
  @ApiProperty() @IsDateString() dateFin: string;
  @ApiPropertyOptional() @IsOptional() @IsString() couverture?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() documentUrl?: string;
}

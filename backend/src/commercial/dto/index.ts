import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClientType, Priorite, ProspectStatut, ReceptionStatut, ReserveStatut, SavStatut, SituationStatut } from '@prisma/client';

export class CreateProspectDto {
  @ApiProperty() @IsString() @IsNotEmpty() nom: string;
  @ApiPropertyOptional({ enum: ClientType }) @IsOptional() @IsEnum(ClientType) type?: ClientType;
  @ApiPropertyOptional() @IsOptional() @IsString() contactNom?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telephone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() projet?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) budgetEstime?: number;
}
export class ChangeProspectStatusDto { @ApiProperty({ enum: ProspectStatut }) @IsEnum(ProspectStatut) statut: ProspectStatut; }

export class CreateVisiteDto {
  @ApiProperty() @IsDateString() datePrevue: string;
  @ApiProperty() @IsString() @IsNotEmpty() objet: string;
  @ApiPropertyOptional() @IsOptional() @IsString() adresse?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() chantierId?: string;
}
export class CompleteVisiteDto {
  @ApiProperty() @IsString() @IsNotEmpty() compteRendu: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateRealisee?: string;
}

export class CreateReceptionDto {
  @ApiProperty() @IsDateString() date: string;
  @ApiPropertyOptional({ enum: ReceptionStatut }) @IsOptional() @IsEnum(ReceptionStatut) statut?: ReceptionStatut;
  @ApiPropertyOptional() @IsOptional() @IsString() pvUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observations?: string;
}
export class CreateReserveDto {
  @ApiProperty() @IsString() @IsNotEmpty() zone: string;
  @ApiProperty() @IsString() @IsNotEmpty() description: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() echeance?: string;
}
export class ChangeReserveStatusDto { @ApiProperty({ enum: ReserveStatut }) @IsEnum(ReserveStatut) statut: ReserveStatut; @ApiPropertyOptional() @IsOptional() @IsString() preuveUrl?: string; }

export class CreateSavDto {
  @ApiProperty() @IsString() @IsNotEmpty() objet: string;
  @ApiProperty() @IsString() @IsNotEmpty() description: string;
  @ApiPropertyOptional({ enum: Priorite }) @IsOptional() @IsEnum(Priorite) priorite?: Priorite;
  @ApiPropertyOptional() @IsOptional() @IsDateString() echeance?: string;
}
export class ChangeSavStatusDto { @ApiProperty({ enum: SavStatut }) @IsEnum(SavStatut) statut: SavStatut; @ApiPropertyOptional() @IsOptional() @IsString() resolution?: string; }

export class CreateSituationDto {
  @ApiProperty() @IsDateString() periodeDebut: string;
  @ApiProperty() @IsDateString() periodeFin: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0.01) totalHt: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) tauxRetenue?: number;
}
export class ChangeSituationStatusDto { @ApiProperty({ enum: SituationStatut }) @IsEnum(SituationStatut) statut: SituationStatut; }

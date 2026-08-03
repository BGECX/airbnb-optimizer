import { IsString, IsOptional, IsUUID, IsDateString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContratType, PointageType, Priorite } from '@prisma/client';

// Employé
export class CreateEmployeDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty()
  @IsString()
  prenom: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  numeroSecu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fonction?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateEntree?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() userId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) coutHoraireCharge?: number;
}

export class UpdateEmployeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fonction?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() userId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) coutHoraireCharge?: number;
}

// Contrat
export class CreateContratDto {
  @ApiProperty()
  @IsUUID()
  employeId: string;

  @ApiProperty({ enum: ContratType })
  @IsEnum(ContratType)
  type: ContratType;

  @ApiProperty()
  @IsDateString()
  dateDebut: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiProperty()
  @IsString()
  poste: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coefficient?: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  salaireBrut: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dureeEssai?: string;
}

// Pointage
export class CreatePointageDto {
  @ApiProperty()
  @IsUUID()
  employeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  chantierId?: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsDateString()
  heureDebut: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  heureFin?: string;

  @ApiPropertyOptional({ enum: PointageType })
  @IsOptional()
  @IsEnum(PointageType)
  type?: PointageType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

// Bon d'intervention
export class CreateBonDto {
  @ApiProperty()
  @IsUUID()
  employeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  chantierId?: string;

  @ApiProperty()
  @IsString()
  objet: string;

  @ApiPropertyOptional({ enum: Priorite })
  @IsOptional()
  @IsEnum(Priorite)
  priorite?: Priorite;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

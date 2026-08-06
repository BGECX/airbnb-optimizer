import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Length, Max, Min } from "class-validator";
import { QuoteStrategy } from "../margin-engine";

export class CompareSupplierQuotesDto {
  @IsString() @Length(3, 180) productUid!: string;
  @IsOptional() @Type(() => Number) @IsInt() @IsPositive() printfulVariantId?: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(100000) quantity!: number;
  @Type(() => Number) @IsNumber() @IsPositive() salePriceHt!: number;
  @IsString() @Length(2, 2) country!: string;
  @IsString() @Length(2, 12) postCode!: string;
  @IsString() @Length(1, 120) city!: string;
  @IsOptional() @IsEnum(["BEST_MARGIN", "BALANCED", "FASTEST"]) strategy?: QuoteStrategy;
}

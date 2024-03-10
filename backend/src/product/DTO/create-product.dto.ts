import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly description: string;

  @IsNumber()
  readonly price: number;

  @IsOptional()
  @IsNumber()
  readonly categoryId: number;

  @IsArray()
  @IsOptional()
  readonly images?: string[];
}

import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly description: string;

  @IsNumber()
  readonly price: number;

  @IsString()
  @IsOptional()
  readonly brand?: string;

  @IsNumber()
  @IsOptional()
  readonly categoryId?: number;
}

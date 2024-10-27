import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ProductCondition, ProductSize } from '@prisma/client';

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

  @IsEnum(ProductCondition)
  @IsOptional()
  readonly condition?: ProductCondition = ProductCondition.GOOD;

  @IsEnum(ProductSize)
  @IsOptional()
  readonly size?: ProductSize;

  @IsString()
  @IsOptional()
  readonly color?: string;
}

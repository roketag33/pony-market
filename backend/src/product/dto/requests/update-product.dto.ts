import { IsOptional } from 'class-validator';
import { CreateProductDto } from './create-product-request.dto';
import { ProductCondition, ProductSize } from '@prisma/client';

export class UpdateProductDto implements Partial<CreateProductDto> {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  price?: number;

  @IsOptional()
  brand?: string;

  @IsOptional()
  categoryId?: number;

  @IsOptional()
  condition?: ProductCondition;

  @IsOptional()
  size?: ProductSize;

  @IsOptional()
  color?: string;
}

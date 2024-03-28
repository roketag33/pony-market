import { IsNumber, IsString, IsDate } from 'class-validator';

export class ProductResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString({ each: true })
  images: string[];

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

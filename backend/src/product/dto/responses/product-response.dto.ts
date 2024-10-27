import { IsNumber, IsString, IsDate } from 'class-validator';
import { ProductCondition, ProductSize } from '@prisma/client';

export class ProductResponseDto {
  id: number;
  name: string;
  description: string;
  price: number;
  brand?: string;
  categoryId?: number;
  condition: ProductCondition;
  size?: ProductSize;
  color?: string;
  weight?: number;
  images: string[];
  isNegotiable: boolean;
  isReserved: boolean;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

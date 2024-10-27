import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsString,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateOrderDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  buyerId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sellerId: number;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  productIds: number[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @ApiProperty({ enum: OrderStatus })
  @IsString()
  status: OrderStatus;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  shippingAddressId?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  billingAddressId?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  shippingCost?: number = 0;
}

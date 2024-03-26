import { IsNotEmpty, IsNumber, IsArray, IsString } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateOrderdto {
  @IsNumber()
  @IsNotEmpty()
  buyerId: number;

  @IsNumber()
  @IsNotEmpty()
  sellerId: number;

  @IsArray()
  @IsNotEmpty()
  productIds: number[];

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;
  @IsString()
  status: OrderStatus;
}

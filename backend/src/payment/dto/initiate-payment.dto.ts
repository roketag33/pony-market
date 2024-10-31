import { IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  buyerId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sellerId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;
}

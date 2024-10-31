import { IsNumber, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestRefundDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  transactionId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}

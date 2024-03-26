import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderdto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  createOrder(@Body() createOrderdto: CreateOrderdto) {
    return this.orderService.createOrder(createOrderdto);
  }
  @Get(':orderId')
  getOrderById(@Param('orderId') orderId: string) {
    return this.orderService.findOrderById(+orderId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  getAllOrdersByUserId(@Param('userId') userId: string) {
    return this.orderService.findAllOrdersByUserId(+userId);
  }
}

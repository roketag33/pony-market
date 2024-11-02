import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../tools/common/guards/jwt-auth.guard';
import { CurrentUser } from '../tools/common/decorators/auth/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.id !== createOrderDto.buyerId) {
      throw new ForbiddenException('You can only create orders for yourself');
    }
    return this.orderService.createOrder(createOrderDto);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(
    @Param('orderId') orderId: string,
    @CurrentUser() currentUser: User,
  ) {
    const order = await this.orderService.findOrderById(+orderId);
    if (order.buyerId !== currentUser.id && order.sellerId !== currentUser.id) {
      throw new ForbiddenException('You can only access your own orders');
    }
    return order;
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all orders for a user' })
  @ApiResponse({ status: 200, description: 'Orders found' })
  async getAllOrdersByUserId(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User,
  ) {
    if (+userId !== currentUser.id) {
      throw new ForbiddenException('You can only access your own orders');
    }
    return this.orderService.findAllOrdersByUserId(+userId);
  }
}

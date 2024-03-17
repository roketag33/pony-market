import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../tools/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    const buyer = await this.prisma.user.findUnique({
      where: { id: dto.buyerId },
    });
    const seller = await this.prisma.user.findUnique({
      where: { id: dto.sellerId },
    });

    if (!buyer || !seller) {
      throw new BadRequestException('Acheteur ou vendeur introuvable.');
    }

    return this.prisma.order.create({
      data: {
        buyerId: dto.buyerId,
        sellerId: dto.sellerId,
        totalPrice: dto.totalPrice,
        status: dto.status,
      },
    });
  }
}

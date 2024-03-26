import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../tools/prisma/prisma.service';
import { CreateOrderdto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderdto) {
    const buyer = await this.prisma.user.findUnique({
      where: { id: dto.buyerId },
    });
    const seller = await this.prisma.user.findUnique({
      where: { id: dto.sellerId },
    });

    if (!buyer || !seller) {
      throw new BadRequestException('Acheteur ou vendeur introuvable.');
    }
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: dto.productIds },
      },
    });
    if (products.length !== dto.productIds.length) {
      throw new BadRequestException(
        'Un ou plusieurs produits sont introuvables.',
      );
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
  async findOrderById(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { products: true },
    });

    if (!order) {
      throw new NotFoundException(
        `Commande avec l'ID "${orderId}" non trouvée.`,
      );
    }

    return order;
  }

  async findAllOrdersByUserId(userId: number) {
    return this.prisma.order.findMany({
      where: { buyerId: userId },
      include: { products: true },
    });
  }
}

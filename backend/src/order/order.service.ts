import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../tools/prisma/prisma.service';
import { PaymentService } from '../payment/payment.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Vérifications parallèles
        const [buyer, seller, products] = await Promise.all([
          prisma.user.findUnique({
            where: { id: dto.buyerId },
            select: { id: true, status: true },
          }),
          prisma.user.findUnique({
            where: { id: dto.sellerId },
            select: { id: true, status: true },
          }),
          prisma.product.findMany({
            where: {
              id: { in: dto.productIds },
              isAvailable: true,
              userId: dto.sellerId, // Vérifier que les produits appartiennent au vendeur
            },
          }),
        ]);

        // Validations
        if (!buyer || !seller) {
          throw new BadRequestException('Acheteur ou vendeur introuvable');
        }
        if (products.length !== dto.productIds.length) {
          throw new BadRequestException('Certains produits sont indisponibles');
        }

        // Calcul du prix total pour vérification
        const calculatedTotal = products.reduce(
          (sum, product) => sum + product.price,
          0,
        );
        if (Math.abs(calculatedTotal - dto.totalPrice) > 0.01) {
          // Tolérance pour les erreurs d'arrondi
          throw new BadRequestException(
            'Le prix total ne correspond pas aux produits',
          );
        }

        // Création de la commande
        const order = await prisma.order.create({
          data: {
            buyerId: dto.buyerId,
            sellerId: dto.sellerId,
            totalPrice: dto.totalPrice,
            status: OrderStatus.PENDING,
            shippingAddressId: dto.shippingAddressId,
            billingAddressId: dto.billingAddressId,
            shippingCost: dto.shippingCost || 0,
            products: {
              connect: products.map((p) => ({ id: p.id })),
            },
          },
          include: {
            products: true,
            buyer: true,
            seller: true,
          },
        });

        // Initier le paiement
        const payment = await this.paymentService.initiatePayment({
          orderId: order.id,
          amount: order.totalPrice + order.shippingCost,
          buyerId: order.buyerId, // Changé de customerId à buyerId
          sellerId: order.sellerId, // Ajout du sellerId requis
        });

        // Émettre l'événement
        this.eventEmitter.emit('order.created', { order, payment });

        return { order, payment };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Erreur de base de données');
      }
      throw error;
    }
  }

  async findOrderById(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        products: true,
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        Payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Commande ${orderId} non trouvée`);
    }

    return order;
  }

  async findAllOrdersByUserId(userId: number) {
    return this.prisma.order.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        products: true,
        Payment: {
          select: {
            status: true,
            amount: true,
            provider: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

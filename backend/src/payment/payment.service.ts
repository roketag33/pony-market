import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../tools/prisma/prisma.service';
import { Stripe } from 'stripe';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PaymentStatus,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  public readonly PLATFORM_FEE_PERCENTAGE = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-10-28.acacia',
    });
  }

  async initiatePayment(data: {
    orderId: number;
    amount: number;
    buyerId: number;
    sellerId: number;
  }) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        // 1. Vérifier l'ordre et les utilisateurs
        const order = await prisma.order.findUnique({
          where: { id: data.orderId },
          include: {
            buyer: true,
            seller: true,
          },
        });

        if (!order) {
          throw new BadRequestException('Commande introuvable');
        }

        // 2. Créer ou récupérer le client Stripe
        const buyerStripeId = await this.getOrCreateStripeCustomer(
          data.buyerId,
        );

        // 3. Calculer commission
        const commission = Math.round(
          data.amount * (this.PLATFORM_FEE_PERCENTAGE / 100),
        );

        // 4. Créer l'intention de paiement Stripe
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(data.amount * 100), // Conversion en centimes
          currency: 'eur',
          customer: buyerStripeId,
          metadata: {
            orderId: data.orderId.toString(),
            buyerId: data.buyerId.toString(),
            sellerId: data.sellerId.toString(),
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });

        // 5. Créer la transaction
        const transaction = await prisma.transaction.create({
          data: {
            amount: data.amount,
            type: TransactionType.PAYMENT,
            status: TransactionStatus.PENDING,
            orderId: data.orderId,
            sellerId: data.sellerId,
            buyerId: data.buyerId,
            commission,
            stripePaymentIntentId: paymentIntent.id,
            currency: 'EUR',
          },
        });

        // 6. Créer l'enregistrement de paiement
        await prisma.payment.create({
          data: {
            orderId: data.orderId,
            amount: data.amount,
            currency: 'EUR',
            provider: 'STRIPE',
            status: PaymentStatus.PENDING,
            transactionId: paymentIntent.id,
          },
        });

        // 7. Émettre l'événement
        this.eventEmitter.emit('payment.initiated', {
          transaction,
          order,
          paymentIntent,
        });

        return {
          clientSecret: paymentIntent.client_secret,
          transactionId: transaction.id,
        };
      });
    } catch (error) {
      console.error("Erreur lors de l'initiation du paiement:", error);
      throw new InternalServerErrorException(
        "Erreur lors de l'initiation du paiement",
      );
    }
  }

  private async getOrCreateStripeCustomer(userId: number): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user.id.toString(),
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  async handleWebhook(signature: string, payload: Buffer) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET'),
      );

      await this.handleStripeEvent(event);

      return { received: true };
    } catch (error) {
      console.error('Erreur webhook:', error);
      throw new InternalServerErrorException(
        'Erreur lors du traitement du webhook',
      );
    }
  }

  private async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.$transaction(async (prisma) => {
      // 1. Trouver la transaction
      const transaction = await prisma.transaction.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (!transaction) {
        throw new Error('Transaction non trouvée');
      }

      // 2. Mettre à jour la transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.COMPLETED },
      });

      // 3. Mettre à jour le paiement
      await prisma.payment.updateMany({
        where: { transactionId: paymentIntent.id },
        data: { status: PaymentStatus.COMPLETED },
      });

      // 4. Mettre à jour la commande
      await prisma.order.update({
        where: { id: Number(paymentIntent.metadata.orderId) },
        data: { status: 'PAID' },
      });

      // 5. Émettre l'événement
      this.eventEmitter.emit('payment.succeeded', { transaction });
    });
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.$transaction(async (prisma) => {
      // 1. Trouver la transaction
      const transaction = await prisma.transaction.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (!transaction) {
        throw new Error('Transaction non trouvée');
      }

      // 2. Mettre à jour la transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.FAILED },
      });

      // 3. Mettre à jour le paiement
      await prisma.payment.updateMany({
        where: { transactionId: paymentIntent.id },
        data: { status: PaymentStatus.FAILED },
      });

      // 4. Mettre à jour la commande
      await prisma.order.update({
        where: { id: Number(paymentIntent.metadata.orderId) },
        data: { status: 'CANCELLED' },
      });

      // 5. Émettre l'événement
      this.eventEmitter.emit('payment.failed', { transaction });
    });
  }

  async processRefund(data: {
    transactionId: number;
    reason: string;
    requestedById: number;
  }) {
    return this.prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transaction.findUnique({
        where: { id: data.transactionId },
        include: { order: true },
      });

      if (!transaction) {
        throw new BadRequestException('Transaction introuvable');
      }

      if (transaction.status !== TransactionStatus.COMPLETED) {
        throw new BadRequestException(
          'La transaction ne peut pas être remboursée',
        );
      }

      const refund = await prisma.refund.create({
        data: {
          transactionId: data.transactionId,
          amount: transaction.amount,
          reason: data.reason,
          status: PaymentStatus.PENDING,
          requestedById: data.requestedById,
        },
      });

      this.eventEmitter.emit('refund.requested', { refund, transaction });

      return refund;
    });
  }
}

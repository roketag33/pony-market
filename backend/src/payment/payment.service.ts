// src/payment/payment.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../tools/prisma/prisma.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async initiatePayment(paymentData: {
    orderId: number;
    amount: number;
    currency?: string;
    customerId: number;
  }) {
    return this.createPaymentIntent({
      orderId: paymentData.orderId.toString(),
      amount: paymentData.amount,
    });
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    try {
      // Récupérer la commande
      const order = await this.prisma.order.findUnique({
        where: { id: parseInt(dto.orderId) },
        include: {
          buyer: true,
          seller: true,
        },
      });

      if (!order) {
        throw new Error('Commande non trouvée');
      }

      // Créer l'intention de paiement
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(dto.amount * 100), // Conversion en centimes
        currency: 'eur',
        metadata: {
          orderId: dto.orderId,
          buyerId: order.buyerId.toString(),
          sellerId: order.sellerId.toString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Enregistrer le paiement dans la base de données
      await this.prisma.payment.create({
        data: {
          orderId: parseInt(dto.orderId),
          amount: dto.amount,
          currency: 'EUR',
          provider: 'STRIPE',
          status: 'PENDING',
          transactionId: paymentIntent.id,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error('Erreur création payment intent:', error);
      throw new InternalServerErrorException(
        'Erreur lors de la création du paiement',
      );
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET'),
      );

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

      return { received: true };
    } catch (error) {
      console.error('Erreur webhook:', error);
      throw new InternalServerErrorException('Erreur webhook Stripe');
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = parseInt(paymentIntent.metadata.orderId);

    await this.prisma.$transaction(async (prisma) => {
      await prisma.payment.updateMany({
        where: {
          transactionId: paymentIntent.id,
        },
        data: {
          status: 'COMPLETED',
        },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PENDING',
        },
      });
    });
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.updateMany({
      where: {
        transactionId: paymentIntent.id,
      },
      data: {
        status: 'FAILED',
      },
    });
  }
}

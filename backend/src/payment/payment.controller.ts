import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { PrismaService } from '@/tools/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '@/tools/common/guards';
import { CurrentUser } from '@/tools/common/decorators';
import { User } from '@prisma/client';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { RequestRefundDto } from './dto/request-refund.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initier un paiement' })
  @ApiResponse({ status: 201, description: 'Paiement initié avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async initiatePayment(
    @Body() paymentDto: InitiatePaymentDto,
    @CurrentUser() user: User,
  ) {
    // Vérification que l'utilisateur est bien l'acheteur
    if (paymentDto.buyerId !== user.id) {
      throw new BadRequestException(
        'Vous ne pouvez initier un paiement que pour vous-même',
      );
    }

    // Vérification de l'existence de la commande
    const order = await this.prismaService.order.findFirst({
      where: {
        id: paymentDto.orderId,
        buyerId: user.id,
      },
    });

    if (!order) {
      throw new BadRequestException('Commande introuvable ou non autorisée');
    }

    return this.paymentService.initiatePayment({
      orderId: paymentDto.orderId,
      amount: paymentDto.amount,
      buyerId: paymentDto.buyerId,
      sellerId: paymentDto.sellerId,
    });
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook Stripe' })
  @ApiResponse({ status: 200, description: 'Webhook traité avec succès' })
  @ApiResponse({ status: 400, description: 'Signature invalide' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Signature Stripe manquante');
    }

    return this.paymentService.handleWebhook(signature, request.rawBody);
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Demander un remboursement' })
  @ApiResponse({ status: 201, description: 'Demande de remboursement créée' })
  @ApiResponse({ status: 400, description: 'Transaction invalide' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async requestRefund(
    @Body() refundDto: RequestRefundDto,
    @CurrentUser() user: User,
  ) {
    // Vérification de la transaction
    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        id: refundDto.transactionId,
        buyerId: user.id,
      },
      include: {
        order: true,
      },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction introuvable ou non autorisée');
    }

    return this.paymentService.processRefund({
      transactionId: refundDto.transactionId,
      reason: refundDto.reason,
      requestedById: user.id,
    });
  }

  @Get('config')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtenir la configuration de paiement' })
  @ApiResponse({
    status: 200,
    description: 'Configuration récupérée avec succès',
  })
  async getPaymentConfig() {
    return {
      publishableKey: this.configService.get('STRIPE_PUBLISHABLE_KEY'),
      platformFee: this.paymentService.PLATFORM_FEE_PERCENTAGE,
    };
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtenir l'historique des transactions" })
  @ApiResponse({
    status: 200,
    description: 'Transactions récupérées avec succès',
  })
  async getTransactions(@CurrentUser() user: User) {
    return this.prismaService.transaction.findMany({
      where: {
        OR: [{ buyerId: user.id }, { sellerId: user.id }],
      },
      include: {
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Get('transaction/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtenir les détails d'une transaction" })
  @ApiResponse({ status: 200, description: 'Transaction trouvée' })
  @ApiResponse({ status: 404, description: 'Transaction non trouvée' })
  async getTransaction(@Param('id') id: string, @CurrentUser() user: User) {
    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        id: Number(id),
        OR: [{ buyerId: user.id }, { sellerId: user.id }],
      },
      include: {
        order: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction non trouvée');
    }

    return transaction;
  }
}

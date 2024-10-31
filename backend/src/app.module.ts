import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';

// Controllers & Services
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';

// Feature Modules
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './Category/category.module';
import { OrderModule } from './order/order.module';
import { MailModule } from './mail/mail.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    // Configuration Modules
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    SentryModule.forRoot(),

    // Feature Modules
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
    OrderModule,
    MailModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MailService,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}

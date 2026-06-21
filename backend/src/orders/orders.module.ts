import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './infrastructure/controllers/orders.controller';
import { OrderService } from './application/services/order.service';
import { OrderRepository } from './infrastructure/repositories/order.repository';
import { OrderTypeOrmEntity } from './infrastructure/persistence/order.typeorm.entity';
import { IOrderRepository } from './domain/repositories/order.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([OrderTypeOrmEntity])],
  controllers: [OrdersController],
  providers: [
    OrderService,
    {
      provide: IOrderRepository,
      useClass: OrderRepository,
    },
  ],
})
export class OrdersModule {}

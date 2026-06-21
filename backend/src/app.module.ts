import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'kitchen_user',
      password: process.env.DB_PASSWORD || 'kitchen_pass',
      database: process.env.DB_NAME || 'kitchen_orders',
      entities: [__dirname + '/orders/infrastructure/persistence/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    OrdersModule,
  ],
})
export class AppModule {}

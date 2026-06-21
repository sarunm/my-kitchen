import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from '../../application/services/order.service';
import { CreateOrderDto } from '../../application/dto/create-order.dto';
import { UpdateOrderStatusDto } from '../../application/dto/update-order-status.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    const order = await this.orderService.createOrder(dto);
    return {
      id: order.id,
      carrier: order.carrier.getValue(),
      number: order.number.getValue(),
      status: order.status.getValue(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  @Get()
  async getOrders(
    @Query('dateOnly') dateOnly?: string,
    @Query('excludeStatus') excludeStatus?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters = {
      dateOnly: dateOnly === 'true',
      status: excludeStatus,
      limit: limit ? parseInt(limit) : 5,
      offset: offset ? parseInt(offset) : 0,
    };

    const result = await this.orderService.getOrders(filters);
    return {
      data: result.data.map((order) => ({
        id: order.id,
        carrier: order.carrier.getValue(),
        number: order.number.getValue(),
        status: order.status.getValue(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      })),
      total: result.total,
    };
  }

  @Patch(':id')
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateOrderStatus(id, dto);
    return {
      id: order.id,
      carrier: order.carrier.getValue(),
      number: order.number.getValue(),
      status: order.status.getValue(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}

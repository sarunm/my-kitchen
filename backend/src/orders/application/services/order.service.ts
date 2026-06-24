import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { IOrderRepository } from "../../domain/repositories/order.repository.interface";
import { Order } from "../../domain/entities/order.entity";
import { Carrier } from "../../domain/value-objects/carrier";
import { OrderNumber } from "../../domain/value-objects/order-number";
import { OrderStatus } from "../../domain/value-objects/order-status";
import { CreateOrderDto } from "../dto/create-order.dto";
import { UpdateOrderStatusDto } from "../dto/update-order-status.dto";

@Injectable()
export class OrderService {
  constructor(private readonly repository: IOrderRepository) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    try {
      const carrier = Carrier.create(dto.carrier);
      const number = OrderNumber.create(dto.number);
      const order = Order.create(carrier, number);
      return await this.repository.save(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(`Invalid order input: ${message}`);
    }
  }

  async getOrders(filters?: {
    status?: string;
    dateOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Order[]; total: number }> {
    return this.repository.findAll(filters);
  }

  async updateOrderStatus(
    id: number,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    try {
      if (dto.status === "done") {
        order.markAsDone();
      } else if (dto.status === "closed") {
        order.markAsClosed();
      } else if (dto.status === "cancelled") {
        order.markAsCancelled();
      }
      return await this.repository.update(id, order);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new BadRequestException(`Cannot update order: ${message}`);
    }
  }
}

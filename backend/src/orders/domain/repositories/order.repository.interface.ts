import { Order } from '../entities/order.entity';

export abstract class IOrderRepository {
  abstract save(order: Order): Promise<Order>;
  abstract findById(id: number): Promise<Order | null>;
  abstract findAll(filters?: {
    status?: string;
    dateOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Order[]; total: number }>;
  abstract update(id: number, order: Order): Promise<Order>;
  abstract delete(id: number): Promise<void>;
}

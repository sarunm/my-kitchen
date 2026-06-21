import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: number): Promise<Order | null>;
  findAll(filters?: {
    status?: string;
    dateOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Order[]; total: number }>;
  update(id: number, order: Order): Promise<Order>;
  delete(id: number): Promise<void>;
}

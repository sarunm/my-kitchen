import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { OrderTypeOrmEntity } from '../persistence/order.typeorm.entity';
import { Carrier } from '../../domain/value-objects/carrier';
import { OrderNumber } from '../../domain/value-objects/order-number';
import { OrderStatus } from '../../domain/value-objects/order-status';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderTypeOrmEntity)
    private readonly typeormRepository: Repository<OrderTypeOrmEntity>,
  ) {}

  async save(order: Order): Promise<Order> {
    const entity = this.orderToPersistence(order);
    const saved = await this.typeormRepository.save(entity);
    return this.persistenceToOrder(saved);
  }

  async findById(id: number): Promise<Order | null> {
    const entity = await this.typeormRepository.findOne({ where: { id } });
    return entity ? this.persistenceToOrder(entity) : null;
  }

  async findAll(filters?: {
    status?: string;
    dateOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Order[]; total: number }> {
    let query = this.typeormRepository.createQueryBuilder('order');

    if (filters?.dateOnly) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.where('order.createdAt >= :today', { today });
    }

    if (filters?.status) {
      query = query.andWhere('order.status != :status', { status: filters.status });
    }

    const limit = filters?.limit || 5;
    const offset = filters?.offset || 0;

    query = query
      .orderBy('order.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    const [entities, total] = await query.getManyAndCount();
    return {
      data: entities.map((e) => this.persistenceToOrder(e)),
      total,
    };
  }

  async update(id: number, order: Order): Promise<Order> {
    const entity = this.orderToPersistence(order);
    entity.id = id;
    const updated = await this.typeormRepository.save(entity);
    return this.persistenceToOrder(updated);
  }

  async delete(id: number): Promise<void> {
    await this.typeormRepository.delete(id);
  }

  private orderToPersistence(order: Order): OrderTypeOrmEntity {
    const entity = new OrderTypeOrmEntity();
    entity.carrier = order.carrier.getValue();
    entity.number = order.number.getValue();
    entity.status = order.status.getValue();
    if (order.id) {
      entity.id = order.id;
    }
    return entity;
  }

  private persistenceToOrder(entity: OrderTypeOrmEntity): Order {
    return Order.reconstruct(
      Carrier.create(entity.carrier),
      OrderNumber.create(entity.number),
      OrderStatus.create(entity.status),
      entity.createdAt,
      entity.updatedAt,
      entity.id,
    );
  }
}

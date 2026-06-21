import { Carrier } from '../value-objects/carrier';
import { OrderNumber } from '../value-objects/order-number';
import { OrderStatus } from '../value-objects/order-status';

export class Order {
  readonly id?: number;
  readonly carrier: Carrier;
  readonly number: OrderNumber;
  status: OrderStatus;
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(
    carrier: Carrier,
    number: OrderNumber,
    status: OrderStatus = OrderStatus.active(),
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    id?: number,
  ) {
    this.carrier = carrier;
    this.number = number;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.id = id;
  }

  static create(
    carrier: Carrier,
    number: OrderNumber,
    status: OrderStatus = OrderStatus.active(),
  ): Order {
    return new Order(carrier, number, status);
  }

  static reconstruct(
    carrier: Carrier,
    number: OrderNumber,
    status: OrderStatus,
    createdAt: Date,
    updatedAt: Date,
    id: number,
  ): Order {
    return new Order(carrier, number, status, createdAt, updatedAt, id);
  }

  markAsDone(): void {
    if (!this.status.isActive()) {
      throw new Error('Cannot mark non-active order as done');
    }
    this.status = OrderStatus.done();
    this.updatedAt = new Date();
  }

  markAsCancelled(): void {
    if (!this.status.isActive()) {
      throw new Error('Cannot mark non-active order as cancelled');
    }
    this.status = OrderStatus.cancelled();
    this.updatedAt = new Date();
  }

  isActive(): boolean {
    return this.status.isActive();
  }

  isTodayOrder(): boolean {
    const today = new Date();
    const createdDate = new Date(this.createdAt);
    return (
      today.getFullYear() === createdDate.getFullYear() &&
      today.getMonth() === createdDate.getMonth() &&
      today.getDate() === createdDate.getDate()
    );
  }

  getDisplayName(): string {
    return `${this.carrier.toString()}-${this.number.toString()}`;
  }
}

export enum OrderStatusType {
  ACTIVE = 'active',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export class OrderStatus {
  private constructor(private readonly value: OrderStatusType) {}

  static create(value: string): OrderStatus {
    if (!Object.values(OrderStatusType).includes(value as OrderStatusType)) {
      throw new Error(`Invalid status: ${value}`);
    }
    return new OrderStatus(value as OrderStatusType);
  }

  static active(): OrderStatus {
    return new OrderStatus(OrderStatusType.ACTIVE);
  }

  static done(): OrderStatus {
    return new OrderStatus(OrderStatusType.DONE);
  }

  static cancelled(): OrderStatus {
    return new OrderStatus(OrderStatusType.CANCELLED);
  }

  getValue(): OrderStatusType {
    return this.value;
  }

  isActive(): boolean {
    return this.value === OrderStatusType.ACTIVE;
  }

  isDone(): boolean {
    return this.value === OrderStatusType.DONE;
  }

  isCancelled(): boolean {
    return this.value === OrderStatusType.CANCELLED;
  }

  isTerminal(): boolean {
    return this.isDone() || this.isCancelled();
  }

  canTransitionTo(newStatus: OrderStatus): boolean {
    // Can only transition from active state
    if (!this.isActive()) return false;
    return true;
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

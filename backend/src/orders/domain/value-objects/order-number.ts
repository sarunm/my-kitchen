export class OrderNumber {
  private constructor(private readonly value: number) {}

  static create(value: number): OrderNumber {
    if (value < 0 || value > 9999) {
      throw new Error('Order number must be between 0 and 9999');
    }
    return new OrderNumber(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: OrderNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString().padStart(4, '0');
  }
}

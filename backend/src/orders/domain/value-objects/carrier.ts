export enum CarrierType {
  GRAB = 'G',
  LINE_MAN = 'L',
  SHOPEE = 'S',
}

export class Carrier {
  private constructor(private readonly value: CarrierType) {}

  static create(value: string): Carrier {
    if (!Object.values(CarrierType).includes(value as CarrierType)) {
      throw new Error(`Invalid carrier: ${value}`);
    }
    return new Carrier(value as CarrierType);
  }

  getValue(): CarrierType {
    return this.value;
  }

  equals(other: Carrier): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

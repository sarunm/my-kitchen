import { IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  carrier!: string;

  @IsNumber()
  @Min(0)
  @Max(9999)
  number!: number;
}

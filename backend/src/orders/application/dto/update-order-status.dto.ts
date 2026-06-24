import { IsString, IsIn } from "class-validator";

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(["done", "closed", "cancelled"])
  status!: string;
}

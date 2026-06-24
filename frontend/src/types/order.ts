export interface Order {
  id: number;
  carrier: string;
  number: number;
  status: "active" | "done" | "closed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface GetOrdersResponse {
  data: Order[];
  total: number;
}

import { Order, GetOrdersResponse } from '@/types/order';

// Derive the backend URL from the host the browser is currently on.
// This makes the same build work on any machine (dev, home server) and any
// device (desktop, mobile) without hardcoding an IP at build time.
const API_URL =
  typeof window !== 'undefined'
    ? `http://${window.location.hostname}:3001`
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const orderApi = {
  createOrder: async (carrier: string, number: number): Promise<Order> => {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carrier, number }),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  getOrders: async (params?: {
    dateOnly?: boolean;
    excludeStatus?: string;
    limit?: number;
    offset?: number;
  }): Promise<GetOrdersResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.dateOnly) queryParams.append('dateOnly', 'true');
    if (params?.excludeStatus) queryParams.append('excludeStatus', params.excludeStatus);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${API_URL}/api/orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  updateOrderStatus: async (id: number, status: 'done' | 'cancelled'): Promise<Order> => {
    const response = await fetch(`${API_URL}/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update order');
    return response.json();
  },
};

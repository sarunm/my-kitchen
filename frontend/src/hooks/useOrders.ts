import { useState, useEffect, useCallback, useRef } from 'react';
import { Order, GetOrdersResponse } from '@/types/order';
import { orderApi } from '@/services/api';

export function useOrders(params?: {
  dateOnly?: boolean;
  excludeStatus?: string;
  limit?: number;
  offset?: number;
  pollInterval?: number;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await orderApi.getOrders({
        dateOnly: params?.dateOnly,
        excludeStatus: params?.excludeStatus,
        limit: params?.limit,
        offset: params?.offset,
      });
      setOrders(response.data);
      setTotal(response.total);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch orders';
      console.error('useOrders error:', errorMsg);
      setError(errorMsg);
      setOrders([]);
    } finally {
      if (!hasInitialized.current) {
        setLoading(false);
        hasInitialized.current = true;
      }
    }
  }, [params?.dateOnly, params?.excludeStatus, params?.limit, params?.offset]);

  useEffect(() => {
    fetchOrders();

    const pollInterval = params?.pollInterval || 3000;
    const interval = setInterval(fetchOrders, pollInterval);

    return () => clearInterval(interval);
  }, [fetchOrders, params?.pollInterval]);

  return { orders, total, loading, error, refetch: fetchOrders };
}

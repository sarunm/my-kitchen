'use client';

import { Order } from '@/types/order';
import { orderApi } from '@/services/api';
import { useState } from 'react';

interface OrderItemProps {
  order: Order;
  onStatusChange: () => void;
  readOnly?: boolean;
}

export function OrderItem({ order, onStatusChange, readOnly = false }: OrderItemProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status: 'done' | 'cancelled') => {
    try {
      setLoading(true);
      await orderApi.updateOrderStatus(order.id, status);
      onStatusChange();
    } catch (err) {
      console.error('Failed to update order:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    active: '#ffb700',
    done: '#4caf50',
    cancelled: '#f44336',
  }[order.status];

  return (
    <div className="order-item" style={{ borderLeftColor: statusColor }}>
      <div className="order-header">
        <h3>
          {order.carrier}-{String(order.number).padStart(4, '0')}
        </h3>
        <span className="status-badge" style={{ backgroundColor: statusColor }}>
          {order.status}
        </span>
      </div>

      <div className="order-time">
        {new Date(order.createdAt).toLocaleString()}
      </div>

      {!readOnly && (
        <div className="order-actions">
          <button
            onClick={() => handleStatusChange('done')}
            disabled={loading || order.status !== 'active'}
            className="btn-done"
          >
            Done
          </button>
          <button
            onClick={() => handleStatusChange('cancelled')}
            disabled={loading || order.status !== 'active'}
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

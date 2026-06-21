'use client';

import { Order } from '@/types/order';
import { OrderItem } from './OrderItem';
import { useState } from 'react';

interface OrderListProps {
  orders: Order[];
  onOrdersChange: () => void;
  readOnly?: boolean;
  showCount?: number;
}

export function OrderList({ orders, onOrdersChange, readOnly = false, showCount = 5 }: OrderListProps) {
  const [offset, setOffset] = useState(0);

  const displayedOrders = orders.slice(offset, offset + showCount);
  const hasMore = offset + showCount < orders.length;
  const hasPrevious = offset > 0;

  return (
    <div className="order-list">
      <div className="orders-container">
        {displayedOrders.length === 0 ? (
          <div className="empty-state">No orders yet</div>
        ) : (
          displayedOrders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              onStatusChange={onOrdersChange}
              readOnly={readOnly}
            />
          ))
        )}
      </div>

      {(hasMore || hasPrevious) && (
        <div className="pagination">
          <button
            onClick={() => setOffset(Math.max(0, offset - showCount))}
            disabled={!hasPrevious}
            className="btn-prev"
          >
            ← Previous
          </button>
          <span className="page-info">
            {offset + 1} - {Math.min(offset + showCount, orders.length)} of {orders.length}
          </span>
          <button
            onClick={() => setOffset(offset + showCount)}
            disabled={!hasMore}
            className="btn-next"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

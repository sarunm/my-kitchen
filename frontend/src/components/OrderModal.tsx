'use client';

import { Order } from '@/types/order';
import { useState } from 'react';

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
  onStatusChange: (id: number, status: 'done' | 'cancelled') => Promise<void>;
}

export function OrderModal({ order, onClose, onStatusChange }: OrderModalProps) {
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const getCarrierName = (carrier: string) => {
    const map: { [key: string]: string } = { G: 'Grab', L: 'Line-Man', S: 'Shopee' };
    return map[carrier] || carrier;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#ffb700';
    }
  };

  const handleStatusChange = async (status: 'done' | 'cancelled') => {
    try {
      setLoading(true);
      await onStatusChange(order.id, status);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order #{order.number}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="order-detail">
            <span className="detail-label">Carrier</span>
            <span className="detail-value">{getCarrierName(order.carrier)}</span>
          </div>

          <div className="order-detail">
            <span className="detail-label">Status</span>
            <span
              className="detail-value status-badge"
              style={{ backgroundColor: getStatusColor(order.status) }}
            >
              {order.status}
            </span>
          </div>

          <div className="order-detail">
            <span className="detail-label">Created</span>
            <span className="detail-value">
              {new Date(order.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="modal-actions">
          {order.status === 'active' && (
            <>
              <button
                className="btn-done"
                onClick={() => handleStatusChange('done')}
                disabled={loading}
              >
                ✓ Done
              </button>
              <button
                className="btn-cancel"
                onClick={() => handleStatusChange('cancelled')}
                disabled={loading}
              >
                ✕ Cancel
              </button>
            </>
          )}
          {order.status !== 'active' && (
            <button className="btn-close" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

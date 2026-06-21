'use client';

import { useState } from 'react';
import { orderApi } from '@/services/api';

interface OrderInputProps {
  onOrderCreated: () => void;
}

export function OrderInput({ onOrderCreated }: OrderInputProps) {
  const [carrier, setCarrier] = useState<'G' | 'L' | 'S'>('G');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number || isNaN(parseInt(number))) {
      setError('Please enter a valid number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await orderApi.createOrder(carrier, parseInt(number));
      setNumber('');
      onOrderCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="order-input">
      <div className="form-group">
        <label>Select Carrier</label>
        <div className="carrier-buttons">
          <button
            type="button"
            className={`carrier-btn ${carrier === 'G' ? 'active' : ''}`}
            onClick={() => setCarrier('G')}
            disabled={loading}
          >
            🚗 Grab
          </button>
          <button
            type="button"
            className={`carrier-btn ${carrier === 'L' ? 'active' : ''}`}
            onClick={() => setCarrier('L')}
            disabled={loading}
          >
            📦 Line-Man
          </button>
          <button
            type="button"
            className={`carrier-btn ${carrier === 'S' ? 'active' : ''}`}
            onClick={() => setCarrier('S')}
            disabled={loading}
          >
            🛒 Shopee
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="number">Order Number (0-9999)</label>
        <input
          id="number"
          type="number"
          min="0"
          max="9999"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          disabled={loading}
          placeholder="Enter order number"
          autoFocus
        />
      </div>

      <button type="submit" disabled={loading || !number}>
        {loading ? 'Creating...' : 'Add Order'}
      </button>

      {error && <div className="error">{error}</div>}
    </form>
  );
}

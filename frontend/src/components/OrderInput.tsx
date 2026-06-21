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
      console.log('Creating order:', { carrier, number: parseInt(number) });
      await orderApi.createOrder(carrier, parseInt(number));
      console.log('Order created successfully');
      setNumber('');
      onOrderCreated();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create order';
      console.error('Order creation failed:', errorMsg);
      setError(errorMsg);
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

      <div className="numpad-display">
        {number ? number : <span className="numpad-placeholder">กรอกหมายเลข</span>}
      </div>

      <div className="numpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button
            key={d}
            type="button"
            className="numpad-btn"
            onClick={() => setNumber((n) => (n + d).slice(0, 4))}
            disabled={loading}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          className="numpad-btn backspace"
          onClick={() => setNumber((n) => n.slice(0, -1))}
          disabled={loading || !number}
        >
          ⌫
        </button>
        <button
          type="button"
          className="numpad-btn"
          onClick={() => setNumber((n) => (n + '0').slice(0, 4))}
          disabled={loading}
        >
          0
        </button>
        <button
          type="submit"
          className="numpad-btn submit"
          disabled={loading || !number}
        >
          {loading ? '…' : '✓'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
    </form>
  );
}

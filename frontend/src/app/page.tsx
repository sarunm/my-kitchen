'use client';

import { useOrders } from '@/hooks/useOrders';
import { OrderInput } from '@/components/OrderInput';
import { OrderList } from '@/components/OrderList';
import { useMemo } from 'react';

export default function ManageOrderPage() {
  const params = useMemo(() => ({ dateOnly: true }), []);
  const { orders, loading, error, refetch } = useOrders(params);

  return (
    <div className="page-container">
      <div className="restaurant-header">
        <h1>🍲 ลองแล แกงใต้</h1>
        <p className="restaurant-tagline">Kitchen Order Management System</p>
      </div>
      <h2>Manage Orders</h2>

      <section className="input-section">
        <h3>Add New Order</h3>
        <OrderInput onOrderCreated={refetch} />
      </section>

      <section className="list-section">
        <h3>Today's Orders ({orders.length})</h3>
        {loading && <div className="loading">Loading orders...</div>}
        {error && <div className="error">Error: {error}</div>}
        {!loading && <OrderList orders={orders} onOrdersChange={refetch} />}
      </section>
    </div>
  );
}

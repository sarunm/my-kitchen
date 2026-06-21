'use client';

import { useOrders } from '@/hooks/useOrders';
import { OrderInput } from '@/components/OrderInput';
import { OrderList } from '@/components/OrderList';
import { useState } from 'react';

export default function ManageOrderPage() {
  const { orders, loading, error, refetch } = useOrders({
    dateOnly: true,
  });

  const [key, setKey] = useState(0);

  const handleOrderCreated = () => {
    setKey((k) => k + 1);
    refetch();
  };

  return (
    <div className="page-container">
      <h2>Manage Orders</h2>

      <section className="input-section">
        <h3>Add New Order</h3>
        <OrderInput onOrderCreated={handleOrderCreated} />
      </section>

      <section className="list-section">
        <h3>Today's Orders ({orders.length})</h3>
        {loading && <div className="loading">Loading orders...</div>}
        {error && <div className="error">Error: {error}</div>}
        {!loading && <OrderList key={key} orders={orders} onOrdersChange={refetch} />}
      </section>
    </div>
  );
}

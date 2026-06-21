'use client';

import { useOrders } from '@/hooks/useOrders';
import { OrderList } from '@/components/OrderList';
import { useMemo } from 'react';

export default function DashboardPage() {
  const params = useMemo(() => ({ excludeStatus: 'cancelled', limit: 5 }), []);
  const { orders, loading, error, refetch } = useOrders(params);

  return (
    <div className="page-container">
      <div className="restaurant-header">
        <h1>🍲 ลองแล แกงใต้</h1>
        <p className="restaurant-tagline">Kitchen Order Management System</p>
      </div>
      <h2>Dashboard</h2>
      <p className="dashboard-subtitle">
        Live view of active and completed orders (auto-refreshes every 3 seconds)
      </p>

      <section className="dashboard-section">
        <div className="dashboard-stats">
          <div className="stat-card">
            <h4>Total Orders</h4>
            <p className="stat-value">{orders.length}</p>
          </div>
          <div className="stat-card">
            <h4>Active</h4>
            <p className="stat-value">
              {orders.filter((o) => o.status === 'active').length}
            </p>
          </div>
          <div className="stat-card">
            <h4>Completed</h4>
            <p className="stat-value">
              {orders.filter((o) => o.status === 'done').length}
            </p>
          </div>
        </div>

        <div className="dashboard-orders">
          {loading && <div className="loading">Loading orders...</div>}
          {error && <div className="error">Error: {error}</div>}
          {!loading && (
            <>
              <OrderList orders={orders} onOrdersChange={refetch} readOnly={true} />
              <p className="dashboard-footer">Last updated: {new Date().toLocaleTimeString()}</p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

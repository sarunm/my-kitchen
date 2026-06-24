"use client";

import { useOrders } from "@/hooks/useOrders";
import { OrderList } from "@/components/OrderList";
import { useMemo } from "react";

export default function DashboardPage() {
  const params = useMemo(
    () => ({ dateOnly: true, excludeStatus: "cancelled", limit: 100 }),
    [],
  );
  const { orders, loading, error, refetch } = useOrders(params);

  return (
    <div className="page-container">
      <div className="restaurant-header">
        <h1>🍲 ลองแล แกงใต้</h1>
        <p className="restaurant-tagline">Kitchen Order Management System</p>
      </div>
      <h2>Dashboard</h2>
      <p className="dashboard-subtitle">
        ออเดอร์วันนี้ (อัปเดตอัตโนมัติทุก 3 วินาที)
      </p>

      <section className="dashboard-section">
        <div className="dashboard-orders">
          {loading && <div className="loading">Loading orders...</div>}
          {error && <div className="error">Error: {error}</div>}
          {!loading && (
            <>
              <OrderList
                orders={orders}
                onOrdersChange={refetch}
                readOnly={true}
              />
              <p className="dashboard-footer">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

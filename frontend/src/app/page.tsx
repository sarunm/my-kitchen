"use client";

import { useMemo, useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { orderApi } from "@/services/api";
import { Order } from "@/types/order";
import { getCarrier } from "@/lib/carriers";
import { Topbar } from "@/components/Topbar";
import { OrderInput } from "@/components/OrderInput";
import { ActionSheet } from "@/components/ActionSheet";
import {
  effectiveStatus,
  doneTier,
  STATUS_LABEL,
  formatAgo,
} from "@/lib/orderStatus";

function toneFor(order: Order): string {
  const { status, doneMinutes } = effectiveStatus(order);
  if (status === "done") return doneTier(doneMinutes); // fresh | wait | late
  return status; // active | closed | cancelled
}

function subFor(order: Order): string {
  const { status, auto, doneMinutes } = effectiveStatus(order);
  if (status === "done") return `เสร็จแล้ว ${formatAgo(doneMinutes)}`;
  if (status === "closed")
    return auto ? "ปิดงานอัตโนมัติ (เกิน 1 ชม.)" : "ปิดงานแล้ว";
  return new Date(order.createdAt).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ManageOrderPage() {
  const params = useMemo(() => ({ dateOnly: true, limit: 100 }), []);
  const { orders, loading, error, refetch } = useOrders(params);
  const [selected, setSelected] = useState<Order | null>(null);

  const handleAction = async (
    id: number,
    status: "done" | "closed" | "cancelled",
  ) => {
    await orderApi.updateOrderStatus(id, status);
    refetch();
  };

  const today = new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="app">
      <Topbar
        subtitle="Order Management"
        active="manage"
        right={
          <span className="pill">
            <span className="dot" /> Live {today}
          </span>
        }
      />

      <div className="grid">
        {/* LEFT: create new order */}
        <section className="panel left">
          <div className="panel-head">
            <div>
              <h2>เพิ่มออเดอร์ใหม่</h2>
              <div className="sub">เลือกผู้จัดส่ง แล้วกรอกหมายเลข</div>
            </div>
          </div>
          <OrderInput onOrderCreated={refetch} />
        </section>

        {/* RIGHT: today's orders */}
        <section className="panel right">
          <div className="panel-head">
            <div>
              <h2>ออเดอร์วันนี้</h2>
              <div className="sub">แตะที่รายการเพื่อเปลี่ยนสถานะ</div>
            </div>
            <span className="count-chip">{orders.length}</span>
          </div>

          <div className="orders">
            {loading && <div className="loading">กำลังโหลด...</div>}
            {error && <div className="error">เกิดข้อผิดพลาด: {error}</div>}
            {!loading && orders.length === 0 && (
              <div className="empty">ยังไม่มีออเดอร์วันนี้</div>
            )}
            {orders.map((order) => {
              const carrier = getCarrier(order.carrier);
              const { status } = effectiveStatus(order);
              const tone = toneFor(order);
              return (
                <div
                  key={order.id}
                  className={`order tone-${tone}`}
                  onClick={() => setSelected(order)}
                >
                  <div className="ico">
                    <img src={carrier.logo} alt={carrier.name} />
                  </div>
                  <div className="info">
                    <div className="no">
                      {order.carrier}-{String(order.number).padStart(4, "0")}{" "}
                      <small>{carrier.name}</small>
                    </div>
                    <div className="time">{subFor(order)}</div>
                  </div>
                  <span className={`badge tone-${tone}`}>
                    {STATUS_LABEL[status]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <ActionSheet
        order={selected}
        onClose={() => setSelected(null)}
        onAction={handleAction}
      />
    </div>
  );
}

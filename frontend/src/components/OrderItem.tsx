"use client";

import { Order } from "@/types/order";
import { orderApi } from "@/services/api";
import { useState } from "react";
import { OrderModal } from "./OrderModal";
import { getCarrier } from "@/lib/carriers";

interface OrderItemProps {
  order: Order;
  onStatusChange: () => void;
  readOnly?: boolean;
}

export function OrderItem({
  order,
  onStatusChange,
  readOnly = false,
}: OrderItemProps) {
  const [showModal, setShowModal] = useState(false);

  const handleStatusChange = async (
    id: number,
    status: "done" | "cancelled",
  ) => {
    try {
      await orderApi.updateOrderStatus(id, status);
      onStatusChange();
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  const statusColor = {
    active: "#ffb700",
    done: "#4caf50",
    cancelled: "#f44336",
  }[order.status];

  const statusLabel =
    {
      active: "กำลังทำ",
      done: "เสร็จ",
      cancelled: "ยกเลิก",
    }[order.status] ?? order.status;

  return (
    <>
      <div
        className={`order-item ${!readOnly ? "clickable" : ""}`}
        style={{ borderLeftColor: statusColor }}
        onClick={() => !readOnly && setShowModal(true)}
      >
        <div className="order-header">
          <h3>
            <img
              className="carrier-logo"
              src={getCarrier(order.carrier).logo}
              alt={getCarrier(order.carrier).name}
            />
            {order.carrier}-{String(order.number).padStart(4, "0")}
          </h3>
          <span
            className="status-badge"
            style={{ backgroundColor: statusColor }}
          >
            {statusLabel}
          </span>
        </div>

        <div className="order-time">
          {new Date(order.createdAt).toLocaleString()}
        </div>

        {!readOnly && <div className="order-hint">👆 Tap to change status</div>}
      </div>

      {!readOnly && (
        <OrderModal
          order={showModal ? order : null}
          onClose={() => setShowModal(false)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}

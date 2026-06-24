"use client";

import { useState } from "react";
import { orderApi } from "@/services/api";
import { CARRIERS, CarrierCode } from "@/lib/carriers";

interface OrderInputProps {
  onOrderCreated: () => void;
}

export function OrderInput({ onOrderCreated }: OrderInputProps) {
  const [carrier, setCarrier] = useState<CarrierCode>("G");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number || isNaN(parseInt(number))) {
      setError("Please enter a valid number");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Creating order:", { carrier, number: parseInt(number) });
      await orderApi.createOrder(carrier, parseInt(number));
      console.log("Order created successfully");
      setNumber("");
      onOrderCreated();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create order";
      console.error("Order creation failed:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="order-input">
      <div className="form-group">
        <div className="carrier-buttons">
          {(Object.keys(CARRIERS) as CarrierCode[]).map((code) => (
            <button
              key={code}
              type="button"
              className={`carrier-btn ${carrier === code ? "active" : ""}`}
              onClick={() => setCarrier(code)}
              disabled={loading}
            >
              <img
                className="carrier-logo"
                src={CARRIERS[code].logo}
                alt={CARRIERS[code].name}
              />
              {CARRIERS[code].name}
            </button>
          ))}
        </div>
      </div>

      <div className="numpad-display">
        {number ? (
          number
        ) : (
          <span className="numpad-placeholder">กรอกหมายเลข</span>
        )}
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
          onClick={() => setNumber((n) => (n + "0").slice(0, 4))}
          disabled={loading}
        >
          0
        </button>
        <button
          type="submit"
          className="numpad-btn submit"
          disabled={loading || !number}
        >
          {loading ? "…" : "✓"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
    </form>
  );
}

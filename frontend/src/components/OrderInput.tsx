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

  const submit = async () => {
    if (!number) return;
    try {
      setLoading(true);
      setError(null);
      await orderApi.createOrder(carrier, parseInt(number));
      setNumber("");
      onOrderCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-body">
      <div className="carriers">
        {(Object.keys(CARRIERS) as CarrierCode[]).map((code) => (
          <button
            key={code}
            type="button"
            className={`carrier ${carrier === code ? "active" : ""}`}
            onClick={() => setCarrier(code)}
            disabled={loading}
          >
            <img src={CARRIERS[code].logo} alt={CARRIERS[code].name} />
            <span>{CARRIERS[code].name}</span>
          </button>
        ))}
      </div>

      <div className="display">
        {number ? number : <span className="ph">กรอกหมายเลข</span>}
      </div>

      <div className="numpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button
            key={d}
            type="button"
            className="key"
            onClick={() => setNumber((n) => (n + d).slice(0, 4))}
            disabled={loading}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          className="key back"
          onClick={() => setNumber((n) => n.slice(0, -1))}
          disabled={loading || !number}
        >
          ⌫
        </button>
        <button
          type="button"
          className="key"
          onClick={() => setNumber((n) => (n + "0").slice(0, 4))}
          disabled={loading}
        >
          0
        </button>
        <button
          type="button"
          className="key submit"
          onClick={submit}
          disabled={loading || !number}
        >
          {loading ? "…" : "✓"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Order } from '@/types/order';
import { getCarrier } from '@/lib/carriers';
import { effectiveStatus, STATUS_LABEL } from '@/lib/orderStatus';

interface ActionSheetProps {
  order: Order | null;
  onClose: () => void;
  onAction: (id: number, status: 'done' | 'closed' | 'cancelled') => Promise<void>;
}

export function ActionSheet({ order, onClose, onAction }: ActionSheetProps) {
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const carrier = getCarrier(order.carrier);
  const { status, auto } = effectiveStatus(order);

  const run = async (next: 'done' | 'closed' | 'cancelled') => {
    try {
      setLoading(true);
      await onAction(order.id, next);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div className="ico">
            <img src={carrier.logo} alt={carrier.name} />
          </div>
          <div>
            <div className="no">
              {order.carrier}-{String(order.number).padStart(4, '0')}
            </div>
            <div className="sub">
              {carrier.name} · {STATUS_LABEL[status]}
            </div>
          </div>
        </div>

        <div className="sheet-actions">
          {status === 'active' && (
            <>
              <button className="act done" onClick={() => run('done')} disabled={loading}>
                ✓ ทำเสร็จ (พร้อมรับ)
              </button>
              <button
                className="act cancel"
                onClick={() => run('cancelled')}
                disabled={loading}
              >
                ✕ ยกเลิกออเดอร์
              </button>
            </>
          )}

          {status === 'done' && (
            <button className="act close" onClick={() => run('closed')} disabled={loading}>
              📦 ปิดงาน (ไรเดอร์รับแล้ว)
            </button>
          )}

          {(status === 'closed' || status === 'cancelled') && (
            <div className="sheet-note">
              {status === 'cancelled'
                ? 'ออเดอร์นี้ถูกยกเลิกแล้ว'
                : `ออเดอร์นี้ปิดงานแล้ว${auto ? ' (อัตโนมัติ เกิน 1 ชม.)' : ''}`}
            </div>
          )}

          <button className="act ghost" onClick={onClose} disabled={loading}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

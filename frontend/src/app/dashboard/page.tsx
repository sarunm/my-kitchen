"use client";

import { useEffect, useMemo, useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/types/order";
import { getCarrier } from "@/lib/carriers";
import { Topbar } from "@/components/Topbar";
import {
  effectiveStatus,
  doneTier,
  formatAgo,
  DoneTier,
} from "@/lib/orderStatus";

const GROUPS: { key: DoneTier; cls: string; label: string }[] = [
  { key: "fresh", cls: "g-fresh", label: "เสร็จแล้ว < 15 นาที" },
  { key: "wait", cls: "g-wait", label: "เสร็จแล้ว > 15 นาที" },
  { key: "late", cls: "g-late", label: "เสร็จแล้ว > 30 นาที" },
];

function ActiveCard({ order }: { order: Order }) {
  const carrier = getCarrier(order.carrier);
  return (
    <div className="card">
      <div className="ico">
        <img src={carrier.logo} alt={carrier.name} />
      </div>
      <div className="no">{String(order.number).padStart(4, "0")}</div>
      <div className="meta">
        {carrier.name} ·{" "}
        {new Date(order.createdAt).toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}

function DoneCard({ order, minutes }: { order: Order; minutes: number }) {
  const carrier = getCarrier(order.carrier);
  return (
    <div className="card">
      <div className="ico">
        <img src={carrier.logo} alt={carrier.name} />
      </div>
      <div className="no">{String(order.number).padStart(4, "0")}</div>
      <div className="meta">
        {carrier.name} · {formatAgo(minutes)}ที่แล้ว
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const params = useMemo(
    () => ({ dateOnly: true, excludeStatus: "cancelled", limit: 100 }),
    [],
  );
  const { orders } = useOrders(params);
  const [clock, setClock] = useState("--:--");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // คำนวณคอลัมน์จากสถานะที่ใช้แสดงจริง (รวม auto-close)
  const active: Order[] = [];
  const doneByTier: Record<DoneTier, { order: Order; minutes: number }[]> = {
    fresh: [],
    wait: [],
    late: [],
  };

  for (const o of orders) {
    const { status, doneMinutes } = effectiveStatus(o);
    if (status === "active") active.push(o);
    else if (status === "done")
      doneByTier[doneTier(doneMinutes)].push({
        order: o,
        minutes: doneMinutes,
      });
    // closed (รวม auto >1ชม.) จะไม่แสดงบนจอไรเดอร์
  }

  const doneTotal =
    doneByTier.fresh.length + doneByTier.wait.length + doneByTier.late.length;

  return (
    <div className="app">
      <Topbar
        subtitle="ออเดอร์วันนี้ · สำหรับไรเดอร์"
        active="dashboard"
        right={
          <>
            <span className="pill">
              <span className="dot" /> Live
            </span>
            <span className="clock">{clock}</span>
          </>
        }
      />

      <div className="board">
        {/* กำลังทำ */}
        <section className="column active">
          <div className="col-head">
            <div className="col-title">
              <span className="mark active" /> กำลังทำ
            </div>
            <span className="col-count">{active.length}</span>
          </div>
          <div className="cards">
            {active.length === 0 ? (
              <div className="empty">ไม่มีออเดอร์ที่กำลังทำ</div>
            ) : (
              active.map((o) => <ActiveCard key={o.id} order={o} />)
            )}
          </div>
        </section>

        {/* พร้อมรับ */}
        <section className="column done">
          <div className="col-head">
            <div className="col-title">
              <span className="mark done" /> พร้อมรับ
            </div>
            <span className="col-count">{doneTotal}</span>
          </div>
          <div className="groups">
            {doneTotal === 0 && (
              <div className="empty">ยังไม่มีออเดอร์ที่พร้อมรับ</div>
            )}
            {GROUPS.map((g) => {
              const items = doneByTier[g.key].sort(
                (a, b) => b.minutes - a.minutes,
              );
              if (items.length === 0) return null;
              return (
                <div key={g.key} className={`group ${g.cls}`}>
                  <div className="group-head">
                    <span className="g-label">{g.label}</span>
                    <span className="g-count">{items.length}</span>
                  </div>
                  <div className="cards">
                    {items.map(({ order, minutes }) => (
                      <DoneCard
                        key={order.id}
                        order={order}
                        minutes={minutes}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

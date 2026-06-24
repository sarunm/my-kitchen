import { Order } from '@/types/order';

export type EffectiveStatus = 'active' | 'done' | 'closed' | 'cancelled';
export type DoneTier = 'fresh' | 'wait' | 'late';

// เกินเวลานี้ (นาที) นับว่า "ปิดงานอัตโนมัติ"
export const AUTO_CLOSE_MIN = 60;

// เกณฑ์การไล่สีของออเดอร์ที่ "พร้อมรับ" (นาทีตั้งแต่ทำเสร็จ)
export const TIER_WAIT_MIN = 15;
export const TIER_LATE_MIN = 30;

export const STATUS_LABEL: Record<EffectiveStatus, string> = {
  active: 'กำลังทำ',
  done: 'พร้อมรับ',
  closed: 'ปิดงานแล้ว',
  cancelled: 'ยกเลิก',
};

export function minutesSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

export function formatAgo(min: number): string {
  if (min < 60) return `${min} นาที`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} ชม. ${m} นาที` : `${h} ชม.`;
}

/**
 * สถานะที่ใช้แสดงผลจริง โดยคำนวณ auto-close:
 * ออเดอร์ที่ทำเสร็จ (done) แต่ผ่านไปเกิน 1 ชม. จะถือว่า "ปิดงานอัตโนมัติ"
 */
export function effectiveStatus(order: Order): {
  status: EffectiveStatus;
  auto: boolean;
  doneMinutes: number;
} {
  if (order.status === 'done') {
    const doneMinutes = minutesSince(order.updatedAt);
    if (doneMinutes >= AUTO_CLOSE_MIN) {
      return { status: 'closed', auto: true, doneMinutes };
    }
    return { status: 'done', auto: false, doneMinutes };
  }
  return { status: order.status as EffectiveStatus, auto: false, doneMinutes: 0 };
}

export function doneTier(doneMinutes: number): DoneTier {
  if (doneMinutes < TIER_WAIT_MIN) return 'fresh';
  if (doneMinutes <= TIER_LATE_MIN) return 'wait';
  return 'late';
}

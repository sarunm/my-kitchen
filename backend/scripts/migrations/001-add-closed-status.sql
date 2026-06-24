-- Migration 001: allow the 'closed' order status (ปิดงาน)
--
-- Context:
--   The orders.status column is VARCHAR(20) guarded by a CHECK constraint.
--   Adding the new 'closed' status only requires widening that constraint —
--   no column type change and no new columns are needed.
--
-- When to run:
--   Run ONCE on any database that was created BEFORE the 'closed' status was
--   introduced (production, Raspberry Pi, or older local volumes).
--   Fresh databases get the correct constraint from init-db.sql automatically.
--
-- How to run (example):
--   docker exec -i kitchen-postgres \
--     psql -U kitchen_user -d kitchen_orders -f - < 001-add-closed-status.sql
--   or:
--   psql "$DATABASE_URL" -f 001-add-closed-status.sql
--
-- Safe to run multiple times (idempotent).

BEGIN;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('active', 'done', 'closed', 'cancelled'));

COMMIT;

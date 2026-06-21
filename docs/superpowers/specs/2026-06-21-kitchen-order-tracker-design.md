# Kitchen Order Tracker - Design Spec

**Date**: 2026-06-21  
**Project**: Kitchen Order Management Web App  
**Stack**: Next.js (TS) + NestJS (TS) + PostgreSQL  
**Deployment**: Home Server (192.168.1.131) via Jenkins CI/CD  

---

## 1. Project Overview

A single-user web application for tracking food delivery orders from multiple carriers (Grab, Line-Man, Shopee). The app provides two views:
- **Manage Order Page**: Input new orders, view today's orders, update order status
- **Dashboard**: Read-only view of recent orders with auto-refresh

**Core Features (MVP)**:
- Create orders with format: Carrier (G/L/S) + 4-digit number
- Mark orders as Done or Cancelled
- View all today's orders with scrollable pagination
- Dashboard shows 5 most recent orders (excludes cancelled), auto-refreshes every 2-3s
- Persistent storage in PostgreSQL

---

## 2. Domain-Driven Design (DDD) Model

### 2.1 Ubiquitous Language

**Core Domain Language**:
- **Order**: An immutable record of a food delivery request from a carrier
- **Carrier**: Enum representing delivery service (Grab=G, Line-Man=L, Shopee=S)
- **Order Number**: 4-digit identifier within a carrier (0-9999)
- **Order Status**: State of an order - `active` (being prepared), `done` (completed), `cancelled` (not needed)
- **Order Lifecycle**: active → done OR active → cancelled (terminal states)

### 2.2 Domain Entities & Value Objects

**Order Entity** (Aggregate Root):
```typescript
class Order {
  readonly id: OrderId;                    // Identity (value object)
  readonly carrier: Carrier;               // Value object
  readonly orderNumber: OrderNumber;       // Value object
  status: OrderStatus;                     // Can change
  readonly createdAt: Date;
  updatedAt: Date;
  
  // Domain logic
  markAsDone(): void
  markAsCancelled(): void
  isActive(): boolean
  isTodayOrder(): boolean
}
```

**Value Objects**:
- `OrderId`: Unique identifier (auto-incremented)
- `Carrier`: Enum (G, L, S)
- `OrderNumber`: 0-9999
- `OrderStatus`: Enum (active, done, cancelled)

### 2.3 Bounded Context

**Single Bounded Context**: `Order Management`
- Responsibility: Manage order lifecycle (create, update status, query)
- Not managing: User accounts, payments, notifications, logistics

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    HOME SERVER (192.168.1.131)               │
├──────────────────────────────────┬───────────────────────────┤
│  Next.js Frontend (port 3000)    │ NestJS Backend (port 3001)│
│  ├─ Manage Order (Input+List)    │                           │
│  └─ Dashboard (Read-only)        │                           │
│        │                         │                           │
│        └──────────────────────────┘                           │
│                  │                                            │
│        ┌─────────┴─────────┐                                  │
│        │                   │                                  │
│        ▼                   ▼                                  │
│   PostgreSQL (port 5432)                                     │
│   (orders table)                                             │
└──────────────────────────────────────────────────────────────┘
                    △
                    │ HTTP API calls
                    │ Polling (GET/PATCH)
                    │
        ┌───────────┼──────────────────┐
        │           │                  │
        │           │                  │
┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  RASPBERRY PI 4       │  │  iPad 6              │  │ Desktop/Laptop       │
├───────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│Express.js Dashboard   │  │ Next.js Full App     │  │ Next.js Full App     │
│(port 3002)            │  │ (port 3000 or 3200)  │  │ (via browser)        │
│- Lightweight          │  │ - Manage Order       │  │ - Manage Order       │
│- Read-only            │  │ - Dashboard          │  │ - Dashboard          │
│- No input capability  │  │ - Full capability    │  │ - Full capability    │
└───────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

**Three Frontends**:
1. **Next.js Full App** (home server, port 3000) — for desktop/laptop access
2. **Next.js Full App** (iPad 6) — full Manage Order + Dashboard
3. **Express.js Lightweight Dashboard** (Raspberry Pi) — read-only dashboard only

### 3.1 NestJS Application Architecture (Clean Layers)

```
orders/ (Domain Bounded Context)
├── domain/
│   ├── entities/
│   │   └── Order.ts                (Entity with domain logic)
│   ├── value-objects/
│   │   ├── Carrier.ts              (Enum-like value object)
│   │   ├── OrderNumber.ts
│   │   └── OrderStatus.ts
│   └── repositories/
│       └── IOrderRepository.ts      (Interface/Contract)
├── application/
│   ├── services/
│   │   └── OrderApplicationService.ts (Use cases)
│   ├── dto/
│   │   ├── CreateOrderDto.ts
│   │   └── UpdateOrderStatusDto.ts
│   └── queries/
│       └── GetOrdersQuery.ts        (Query patterns for read operations)
├── infrastructure/
│   ├── repositories/
│   │   └── OrderRepository.ts       (DB implementation)
│   ├── persistence/
│   │   └── order.entity.ts          (TypeORM entity)
│   └── controllers/
│       └── orders.controller.ts     (HTTP endpoints)
└── orders.module.ts
```

This follows **Clean Architecture** with clear separation of concerns.

---

## 3. Database Schema

**Table: orders**

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  
  carrier CHAR(1) NOT NULL,
    CHECK (carrier IN ('S', 'G', 'L')),
  
  number INT NOT NULL,
    CHECK (number >= 0 AND number <= 9999),
  
  status VARCHAR(20) NOT NULL DEFAULT 'active',
    CHECK (status IN ('active', 'done', 'cancelled')),
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

**Constraints**:
- `carrier`: Must be exactly 'S', 'G', or 'L'
- `number`: Must be 0-9999
- `status`: Must be 'active', 'done', or 'cancelled'
- Allows duplicate (carrier, number) pairs
- Auto-timestamps for audit trail

---

## 4. API Endpoints

### POST /api/orders
**Create a new order**

Request:
```json
{
  "carrier": "G",
  "number": 1234
}
```

Response (201):
```json
{
  "id": 1,
  "carrier": "G",
  "number": 1234,
  "status": "active",
  "created_at": "2026-06-21T10:30:00Z",
  "updated_at": "2026-06-21T10:30:00Z"
}
```

---

### GET /api/orders
**Fetch orders with optional filters**

Query Parameters:
- `dateOnly?: boolean` - If true, only return today's orders (based on created_at)
- `excludeStatus?: string` - Exclude orders with this status (e.g., 'cancelled')
- `limit?: number` - Number of orders to return (default: 5)
- `offset?: number` - Pagination offset (default: 0)

Response (200):
```json
{
  "data": [
    {
      "id": 1,
      "carrier": "G",
      "number": 1234,
      "status": "active",
      "created_at": "2026-06-21T10:30:00Z",
      "updated_at": "2026-06-21T10:30:00Z"
    }
  ],
  "total": 15
}
```

**Usage Examples**:
- Page 1 (Manage): `GET /api/orders?dateOnly=true`
- Dashboard: `GET /api/orders?excludeStatus=cancelled&limit=5&offset=0`

---

### PATCH /api/orders/:id
**Update order status**

Request:
```json
{
  "status": "done"
}
```

Response (200):
```json
{
  "id": 1,
  "carrier": "G",
  "number": 1234,
  "status": "done",
  "created_at": "2026-06-21T10:30:00Z",
  "updated_at": "2026-06-21T10:35:00Z"
}
```

---

## 5. Frontend Components

### Page 1: Manage Order

**Structure**:
```
ManageOrderPage
├── OrderInput
│   ├── CarrierSelect (dropdown: G, L, S)
│   └── NumberInput (0-9999)
│   └── SubmitButton
├── OrdersList
    ├── LoadingSpinner (while fetching)
    ├── OrderItem[] (each order)
    │   ├── Display: "G-1234"
    │   ├── Status Badge (active/done/cancelled)
    │   ├── Button: Mark as Done
    │   └── Button: Mark as Cancelled
    └── ScrollableContainer (shows 5, scroll for more)
```

**Behavior**:
- Load all orders for today on mount
- Display 5 most recent, rest scrollable
- Submit new order → append to list
- Click status button → update status immediately + API call
- No pagination buttons; smooth infinite scroll

---

### Page 2: Dashboard

**Structure**:
```
DashboardPage
├── OrdersList (auto-refresh every 2-3s)
    ├── OrderItem[] (read-only)
    │   ├── Display: "G-1234"
    │   ├── Status Badge (active/done only, no cancelled)
    │   └── Created timestamp
    └── ScrollableContainer (shows 5, scroll for more)
```

**Behavior**:
- Auto-fetch every 2-3s with `GET /api/orders?excludeStatus=cancelled`
- Display 5 most recent, rest scrollable
- No status buttons; read-only display
- Hides cancelled orders automatically

---

## 6. Data Flow

### Create Order
1. User enters carrier (G/L/S) and number (0-9999)
2. Frontend validates format
3. Frontend POST to `/api/orders`
4. Backend validates, inserts to DB
5. Frontend receives order object
6. Add order to list (top position, shows in Manage Order)
7. Dashboard detects change on next poll

### Update Status
1. User clicks "Mark as Done" or "Mark as Cancelled"
2. Frontend PATCH to `/api/orders/:id` with new status
3. Backend validates, updates DB
4. Frontend receives updated order
5. Update order in list
6. Dashboard detects change on next poll (or hides if cancelled)

### Dashboard Auto-Refresh
1. Every 2-3s, dashboard calls `GET /api/orders?excludeStatus=cancelled`
2. Compare with current list
3. Update UI with new/modified orders
4. Remove cancelled orders if they appear

---

## 7. Deployment & Infrastructure

### 7.1 Home Server (192.168.1.131) - Docker Compose Stack

**Services**:
- `postgres` (PostgreSQL 15+, port 5432)
- `backend` (NestJS, port 3001)
- `frontend` (Next.js, port 3000)

**docker-compose.yml**:
- All services on single internal network
- Frontend and backend restart policies: `unless-stopped`
- PostgreSQL data persisted via named volume
- Environment variables for DB connection strings (including backend API URL)

### 7.2 iPad 6 - Full Next.js App

**Deployment Options**:

**Option A: Native iPad App (via Capacitor or Expo)**
- Convert Next.js to Expo + React Native (higher effort)
- Native iOS performance and experience

**Option B: Web App (Recommended for MVP)**
- Install progressive web app (PWA) on iPad home screen
- Point to `http://192.168.1.131:3000` (home server Next.js instance)
- Works like native app, zero deployment overhead
- Auto-updates when home server updates

**Option C: Separate Next.js Instance on iPad**
- Clone Next.js to iPad, run locally with SSH tunnel
- More complex, useful if home server is often unreachable

**Recommendation**: Option B (PWA via browser) for MVP simplicity.

**Setup**:
1. Access Next.js app from iPad Safari: `http://192.168.1.131:3000`
2. Tap Share → Add to Home Screen
3. Opens like native app with offline support (if configured)
4. Auto-polls backend for real-time updates

### 7.3 Raspberry Pi (4 Model B) - Lightweight Dashboard

**Service**: Express.js Dashboard (port 3002)

**Stack**:
- Runtime: Node.js 18+ (lightweight)
- Framework: Express.js
- Templating: EJS or Handlebars (simple HTML rendering)
- Styling: Plain CSS or Tailwind CSS
- Client-side polling: Vanilla JS (no React overhead)

**Features**:
- Read-only dashboard view only (no Manage Order input)
- Auto-polls NestJS backend every 2-3s
- Shows 5 most recent orders (excludes cancelled)
- Minimal HTML/CSS, ~100KB total size
- Fast load time (under 100ms)
- Scrollable list for older orders

**Deployment**:
- Git clone/pull to Raspberry Pi
- `npm install && npm start` (or systemd service)
- Connects to backend at `http://192.168.1.131:3001`
- Manual or cron-based updates from git

### 7.4 Jenkins CI/CD Pipeline

**Trigger**: Every push to `main` branch

**Stages**:
1. **Clone**: Fetch latest code
2. **Build**: Build Next.js and NestJS Docker images
3. **Test**: Run unit + integration tests
4. **Push**: Push images to Docker Hub (or local registry)
5. **Deploy Home Server**: 
   - SSH into 192.168.1.131
   - Pull latest images
   - Run `docker-compose up -d`
   - Verify services healthy
6. **Deploy Raspberry Pi**: 
   - SSH into Raspberry Pi
   - Pull latest code
   - Restart Express service (`systemctl restart kitchen-dashboard` or `npm start`)
7. **iPad Notification** (optional):
   - Generate deployment notification
   - iPad accesses home server via PWA, updates auto-fetch on next load

**Deployment Targets**:
| Target | Service | Method | Notes |
|--------|---------|--------|-------|
| Home Server (192.168.1.131) | Docker containers | `docker-compose up -d` | Next.js + NestJS + PostgreSQL |
| Raspberry Pi 4 | Express.js service | Git pull + systemctl restart | Lightweight dashboard only |
| iPad 6 | Browser PWA | Auto-update on next refresh | No deployment needed, just refresh |

**Jenkinsfile**: Defined in project root with declarative pipeline syntax

**Requirements**:
- Docker Hub account (or local registry on home server)
- SSH keys configured in Jenkins:
  - For home server (192.168.1.131)
  - For Raspberry Pi (192.168.1.xxx — user provides IP)
- Home server: Docker + Docker Compose
- Raspberry Pi: Node.js 18+, systemd or process manager
- iPad: Just needs network access to home server

---

## 8. Test-Driven Development (TDD) Strategy

### 8.1 Testing Pyramid

```
           🔺 E2E Tests (5-10%)
              Full flow tests
              
         🔻  Integration Tests (25-30%)
             Repository + Service + Controller
             
    🔻🔻🔻 Unit Tests (60-70%)
         Domain logic, Value Objects, Services
```

### 8.2 Test Structure

**Unit Tests** (Write first in TDD):
- `Order.entity.spec.ts` - Domain entity behavior
  - `markAsDone()` transitions active → done
  - `markAsCancelled()` transitions active → cancelled
  - `isActive()`, `isTodayOrder()` predicates
  - Cannot transition from done/cancelled
  
- `Carrier.spec.ts`, `OrderNumber.spec.ts` - Value objects
  - Valid/invalid values
  - Equality checks

- `OrderApplicationService.spec.ts` - Use cases (with mocked repository)
  - CreateOrder happy path & error cases
  - UpdateOrderStatus happy path & error cases
  - GetOrders with filters

**Integration Tests**:
- `OrderRepository.spec.ts` - DB operations
  - Create, read, update orders
  - Query with dateOnly filter
  - Query with excludeStatus filter
  - Query with limit/offset

- `orders.controller.spec.ts` - HTTP layer
  - POST /api/orders → creates order
  - GET /api/orders → returns filtered list
  - PATCH /api/orders/:id → updates status
  - Error handling (400, 404, etc.)

**E2E Tests**:
- `orders.e2e-spec.ts` - Full flow
  - Create order → verify in list → update status → verify update
  - Dashboard filter (excludeStatus=cancelled)

### 8.3 TDD Workflow per Feature

**For each feature**:
1. Write failing unit test (RED)
2. Implement domain logic (GREEN)
3. Refactor if needed (REFACTOR)
4. Write integration test
5. Write E2E test

**Example: CreateOrder Feature**
1. Test: `OrderApplicationService.create()` should return Order with id
2. Implement: `OrderApplicationService.create(dto)`
3. Test: `OrderRepository.save()` persists to DB
4. Test: `POST /api/orders` endpoint
5. E2E: Full create-and-retrieve flow

### 8.4 Test Tools

**Backend**:
- Jest (unit & integration)
- TypeORM with test database (PostgreSQL in Docker)
- Supertest (HTTP testing)

**Frontend**:
- Vitest (fast unit tests)
- React Testing Library (component tests)
- Cypress (E2E tests)

---

## 9. MVP Scope & Future Considerations

**In Scope**:
- Create, read, update orders
- Two pages (Manage + Dashboard)
- Auto-refresh dashboard
- Persistent storage
- Deployment to home server

**Out of Scope (for MVP)**:
- User authentication / multi-user
- Advanced filtering/search
- Order history/analytics
- Mobile app
- Notifications/alerts
- Real-time WebSocket (polling sufficient)

---

## 10. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Next.js + React | Fast development, built-in API routes, TS support |
| Backend | NestJS | Type-safe, modular, good for REST APIs |
| Database | PostgreSQL | Reliable, good constraints support, single user OK |
| Real-time | Polling (2-3s) | Simple to implement, sufficient for single user |
| Pagination | Client-side (load all today) | Small dataset, smooth UX, no pagination UI needed |
| Deployment | Docker Compose | Simple, reproducible, good for home server |
| CI/CD | Jenkins | Easy setup, home server friendly |
| Container Registry | Docker Hub (or local) | Simple image distribution |
| Architecture Pattern | DDD + Clean Layers | Clear separation, testable, maintainable |
| Testing Approach | TDD (write tests first) | Confidence in domain logic, safety net for refactoring |

---

## 11. Success Criteria

**Functional**:
✅ User can create orders with format "X-NNNN" (X = G/L/S, N = 0-9999)  
✅ User can view all today's orders in Manage Order page  
✅ User can mark orders as Done or Cancelled  
✅ Data persists in PostgreSQL across restarts  
✅ Dashboard shows 5 most recent orders, auto-refreshes every 2-3s  
✅ Dashboard excludes cancelled orders  

**Technical**:
✅ DDD domain model implemented with clear entities & value objects  
✅ Clean architecture layers (domain → application → infrastructure)  
✅ TDD test coverage: >80% for domain logic, >70% overall  
✅ All integration tests pass (repository, service, controller)  
✅ E2E tests cover happy paths

**Deployment (3 Frontends, 1 Backend)**:
✅ Home Server (192.168.1.131): Docker Compose with Next.js + NestJS + PostgreSQL  
✅ iPad 6: PWA accessed via Next.js app (auto-updates on refresh)  
✅ Raspberry Pi 4: Express.js lightweight dashboard (git-based deployment)  
✅ Jenkins pipeline: Auto-deploys to home server & Pi on git push to main  
✅ All three clients can connect to NestJS backend independently

---

## 12. File Structure (TBD in implementation plan)

```
my-kitchen/
├── backend/                 (NestJS)
├── frontend/                (Next.js)
├── docker-compose.yml
├── Jenkinsfile
├── docs/superpowers/specs/  (this file)
└── README.md
```

---

---

## 13. Design Decisions Summary

**Why DDD?**
- Clear separation between domain (Order business logic) and infrastructure (DB/API)
- Easy to test domain logic independently
- Makes the ubiquitous language explicit (Carrier, OrderStatus, etc.)

**Why TDD?**
- Confidence that Order state transitions work correctly (active → done/cancelled)
- Tests serve as documentation for expected behavior
- Refactoring safety net (especially for validation logic)

**Why Clean Architecture?**
- Domain logic doesn't depend on frameworks or databases
- Easy to swap implementations (e.g., use different DB)
- Frontend and backend both follow consistent patterns

---

**Design Document Approved By**: [User to confirm]  
**Ready for Implementation Plan**: [After user approval]

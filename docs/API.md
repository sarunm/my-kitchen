# Kitchen Order Tracker API Reference

Base URL: `http://192.168.1.131:3001` (production) or `http://localhost:3001` (development)

## Endpoints

### POST /api/orders
Create a new order.

**Request:**
```json
{
  "carrier": "G",
  "number": 1234
}
```

**Response (201):**
```json
{
  "id": 1,
  "carrier": "G",
  "number": 1234,
  "status": "active",
  "createdAt": "2026-06-21T10:30:00.000Z",
  "updatedAt": "2026-06-21T10:30:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid carrier (must be G, L, or S) or number (must be 0-9999)

---

### GET /api/orders
Fetch orders with optional filters.

**Query Parameters:**
- `dateOnly` (boolean): Filter to today's orders only
- `excludeStatus` (string): Exclude orders with this status (e.g., 'cancelled')
- `limit` (number): Number of orders to return (default: 5)
- `offset` (number): Pagination offset (default: 0)

**Examples:**
```
# Get today's orders
GET /api/orders?dateOnly=true

# Get orders excluding cancelled
GET /api/orders?excludeStatus=cancelled&limit=5&offset=0

# Get all orders with limit
GET /api/orders?limit=10&offset=0
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "carrier": "G",
      "number": 1234,
      "status": "active",
      "createdAt": "2026-06-21T10:30:00.000Z",
      "updatedAt": "2026-06-21T10:30:00.000Z"
    },
    {
      "id": 2,
      "carrier": "L",
      "number": 5678,
      "status": "done",
      "createdAt": "2026-06-21T09:15:00.000Z",
      "updatedAt": "2026-06-21T10:45:00.000Z"
    }
  ],
  "total": 15
}
```

---

### PATCH /api/orders/:id
Update an order's status.

**Parameters:**
- `id` (path): Order ID

**Request:**
```json
{
  "status": "done"
}
```

**Valid Status Values:**
- `done` - Order completed
- `cancelled` - Order cancelled

**Response (200):**
```json
{
  "id": 1,
  "carrier": "G",
  "number": 1234,
  "status": "done",
  "createdAt": "2026-06-21T10:30:00.000Z",
  "updatedAt": "2026-06-21T10:35:00.000Z"
}
```

**Errors:**
- `404 Not Found` - Order with given ID not found
- `400 Bad Request` - Cannot transition from non-active state or invalid status

---

## Data Models

### Order

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier |
| carrier | string | Single letter: 'G' (Grab), 'L' (Line-Man), 'S' (Shopee) |
| number | number | 4-digit order number (0-9999) |
| status | string | 'active', 'done', or 'cancelled' |
| createdAt | ISO 8601 | Creation timestamp |
| updatedAt | ISO 8601 | Last update timestamp |

### Carrier Values

- `G` - Grab
- `L` - Line-Man
- `S` - Shopee

### Status Values

- `active` - Order is being prepared
- `done` - Order completed
- `cancelled` - Order cancelled (not needed)

---

## Status Code Reference

- `200 OK` - Successful GET/PATCH
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input or invalid state transition
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Example Usage

### Using cURL

```bash
# Create order
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"carrier":"G","number":1234}'

# Get today's orders
curl "http://localhost:3001/api/orders?dateOnly=true"

# Mark order as done
curl -X PATCH http://localhost:3001/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'
```

### Using JavaScript Fetch

```javascript
// Create order
const response = await fetch('http://localhost:3001/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ carrier: 'G', number: 1234 })
});
const order = await response.json();

// Get orders
const ordersRes = await fetch('http://localhost:3001/api/orders?dateOnly=true');
const { data, total } = await ordersRes.json();

// Update status
const updateRes = await fetch(`http://localhost:3001/api/orders/${order.id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'done' })
});
```

---

## CORS

The API is configured to accept requests from:
- `http://192.168.1.131:3000` (Next.js frontend)
- `http://192.168.1.131:3002` (Raspberry Pi dashboard)

Development mode also accepts `http://localhost:*`

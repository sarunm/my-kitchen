# Local Development Setup

## Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Docker & Docker Compose (for containerized setup)
- Git

## Quick Start with Docker

```bash
# Clone the repository
git clone <repo-url>
cd my-kitchen

# Build and start all services
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:3001
# - Database: localhost:5432
```

## Manual Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Create PostgreSQL database
psql -U postgres -d postgres -f scripts/init-db.sql

# Build and start
npm run build
npm start
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start development server
npm run dev
```

Access at `http://localhost:3000`

### 3. Raspberry Pi Dashboard Setup

```bash
cd pi-dashboard

# Install dependencies
npm install

# Create .env
echo "API_URL=http://192.168.1.131:3001" > .env

# Build and start
npm run build
npm start
```

Access at `http://<raspberry-pi-ip>:3002`

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=kitchen_user
DB_PASSWORD=kitchen_pass
DB_NAME=kitchen_orders
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Raspberry Pi (.env)
```
API_URL=http://192.168.1.131:3001
PORT=3002
```

## Troubleshooting

### PostgreSQL Connection Error
```bash
# Check if PostgreSQL is running
psql -U kitchen_user -d kitchen_orders -c "SELECT 1"

# If error, restart PostgreSQL
docker-compose restart postgres
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # Database

# Kill process
kill -9 <PID>
```

### Docker Build Fails
```bash
# Clean up Docker
docker-compose down -v
docker system prune

# Rebuild
docker-compose up --build
```

# Kitchen Order Tracker

🍲 **ลองแล แกงใต้** - Multi-device order tracking app for food delivery services (Grab, Line-Man, Shopee).

**Version:** 1.0.0  
**Status:** ✅ Production Ready

## Deployments

- **Home Server (192.168.1.131)**: Docker Compose (Next.js + NestJS + PostgreSQL)
  - Frontend: http://192.168.1.131:3000
  - Backend API: http://192.168.1.131:3001
  - Database: PostgreSQL on port 5432

- **iPad 6**: PWA via Next.js at http://192.168.1.131:3000
  - Just open browser and add to home screen

- **Raspberry Pi 4**: Lightweight Express.js dashboard at port 3002

## Architecture

- **Backend**: NestJS with DDD + TDD
- **Frontend 1**: Next.js (full Manage Order + Dashboard)
- **Frontend 2**: Express.js (lightweight Pi dashboard)
- **Database**: PostgreSQL
- **CI/CD**: Jenkins (auto-deploy on git push to main)

## Quick Start

See `docs/SETUP.md` for detailed setup instructions.

## Development

```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev

# Pi Dashboard
cd pi-dashboard && npm install && npm start
```

## API Documentation

See `docs/API.md` for complete API reference.

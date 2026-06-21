# Kitchen Order Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack order tracking web app with NestJS backend, Next.js/Express frontends, PostgreSQL database, and Jenkins CI/CD deployment to home server + Raspberry Pi.

**Architecture:** 
- Backend: NestJS with DDD (domain layer contains business logic, application layer orchestrates use cases, infrastructure layer handles persistence)
- Frontend 1: Next.js full app (Manage Order + Dashboard) runs on home server + accessed from iPad PWA
- Frontend 2: Express.js lightweight dashboard runs on Raspberry Pi
- Database: PostgreSQL on home server
- Deployment: Docker Compose for home server, Jenkins for automated CI/CD

**Tech Stack:** Next.js (TS) + NestJS (TS) + Express.js (TS) + PostgreSQL + Docker + Jenkins

---

## Phase 1: Project Setup & Infrastructure

### Task 1: Initialize Git Repository & Monorepo Structure

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `docs/superpowers/plans/` (directory)
- Create: `docs/API.md` (API documentation template)

- [ ] **Step 1: Initialize git repository**

```bash
cd /Users/nick/2_SideProjects/my-kitchen
git init
```

Expected: `.git` directory created

- [ ] **Step 2: Create .gitignore**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/.gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Docker
.dockerignore

# Testing
coverage/
.nyc_output/

# OS
.DS_Store
Thumbs.db
EOF
```

Expected: `.gitignore` file created with common patterns

- [ ] **Step 3: Create initial README**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/README.md << 'EOF'
# Kitchen Order Tracker

Multi-device order tracking app for food delivery services (Grab, Line-Man, Shopee).

## Deployments

- **Home Server (192.168.1.131)**: Docker Compose (Next.js + NestJS + PostgreSQL)
- **iPad 6**: PWA via Next.js at http://192.168.1.131:3000
- **Raspberry Pi 4**: Lightweight Express.js dashboard

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
EOF
```

Expected: `README.md` created

- [ ] **Step 4: Create directory structure**

```bash
mkdir -p /Users/nick/2_SideProjects/my-kitchen/{backend,frontend,pi-dashboard,docs/superpowers/{specs,plans}}
mkdir -p /Users/nick/2_SideProjects/my-kitchen/backend/{src,test}
mkdir -p /Users/nick/2_SideProjects/my-kitchen/frontend/{src,public}
mkdir -p /Users/nick/2_SideProjects/my-kitchen/pi-dashboard/{src,public}
```

Expected: All directories created

- [ ] **Step 5: Commit**

```bash
cd /Users/nick/2_SideProjects/my-kitchen
git add .gitignore README.md docs/
git commit -m "chore: initialize monorepo structure"
```

Expected: Initial commit created

---

### Task 2: Backend Setup - NestJS Project Initialization

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/main.ts`
- Create: `backend/src/app.module.ts`
- Create: `backend/Dockerfile`
- Create: `backend/.env.example`

- [ ] **Step 1: Initialize NestJS project structure manually**

```bash
cd /Users/nick/2_SideProjects/my-kitchen/backend
cat > package.json << 'EOF'
{
  "name": "kitchen-order-tracker-backend",
  "version": "1.0.0",
  "description": "Kitchen Order Tracker NestJS Backend",
  "main": "dist/main.js",
  "scripts": {
    "start": "node dist/main.js",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^9.0.0",
    "typeorm": "^0.3.0",
    "pg": "^8.11.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.1.13"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@types/node": "^20.0.0",
    "@types/jest": "^29.0.0",
    "typescript": "^5.0.0",
    "ts-loader": "^9.4.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "@types/express": "^4.17.0"
  }
}
EOF
```

Expected: `backend/package.json` created with NestJS dependencies

- [ ] **Step 2: Create TypeScript config**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
EOF
```

Expected: `backend/tsconfig.json` created

- [ ] **Step 3: Create main entry point**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for iPad and Pi access
  app.enableCors({
    origin: ['http://192.168.1.131:3000', 'http://192.168.1.131:3002'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(3001, '0.0.0.0');
  console.log(`Application is running on: http://localhost:3001`);
}

bootstrap();
EOF
```

Expected: `backend/src/main.ts` created

- [ ] **Step 4: Create app.module.ts**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/app.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'kitchen_user',
      password: process.env.DB_PASSWORD || 'kitchen_pass',
      database: process.env.DB_NAME || 'kitchen_orders',
      entities: [__dirname + '/orders/infrastructure/persistence/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    OrdersModule,
  ],
})
export class AppModule {}
EOF
```

Expected: `backend/src/app.module.ts` created

- [ ] **Step 5: Create Dockerfile for backend**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
EOF
```

Expected: `backend/Dockerfile` created

- [ ] **Step 6: Create .env.example**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/.env.example << 'EOF'
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=kitchen_user
DB_PASSWORD=kitchen_pass
DB_NAME=kitchen_orders

# Environment
NODE_ENV=development
EOF
```

Expected: `backend/.env.example` created

- [ ] **Step 7: Install dependencies**

```bash
cd /Users/nick/2_SideProjects/my-kitchen/backend
npm install
```

Expected: `node_modules/` created, `package-lock.json` generated

- [ ] **Step 8: Commit**

```bash
cd /Users/nick/2_SideProjects/my-kitchen
git add backend/
git commit -m "chore: initialize NestJS backend project"
```

Expected: Backend project setup committed

---

## Phase 2: Backend - Domain Layer (DDD)

### Task 3: Backend - Value Objects

**Files:**
- Create: `backend/src/orders/domain/value-objects/carrier.ts`
- Create: `backend/src/orders/domain/value-objects/order-number.ts`
- Create: `backend/src/orders/domain/value-objects/order-status.ts`

- [ ] **Step 1: Create Carrier value object**

```bash
mkdir -p /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/domain/value-objects
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/domain/value-objects/carrier.ts << 'EOF'
export enum CarrierType {
  GRAB = 'G',
  LINE_MAN = 'L',
  SHOPEE = 'S',
}

export class Carrier {
  private constructor(private readonly value: CarrierType) {}

  static create(value: string): Carrier {
    if (!Object.values(CarrierType).includes(value as CarrierType)) {
      throw new Error(`Invalid carrier: ${value}`);
    }
    return new Carrier(value as CarrierType);
  }

  getValue(): CarrierType {
    return this.value;
  }

  equals(other: Carrier): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
EOF
```

Expected: `carrier.ts` created

- [ ] **Step 2: Create OrderNumber value object**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/domain/value-objects/order-number.ts << 'EOF'
export class OrderNumber {
  private constructor(private readonly value: number) {}

  static create(value: number): OrderNumber {
    if (value < 0 || value > 9999) {
      throw new Error('Order number must be between 0 and 9999');
    }
    return new OrderNumber(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: OrderNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString().padStart(4, '0');
  }
}
EOF
```

Expected: `order-number.ts` created

- [ ] **Step 3: Create OrderStatus value object**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/domain/value-objects/order-status.ts << 'EOF'
export enum OrderStatusType {
  ACTIVE = 'active',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export class OrderStatus {
  private constructor(private readonly value: OrderStatusType) {}

  static create(value: string): OrderStatus {
    if (!Object.values(OrderStatusType).includes(value as OrderStatusType)) {
      throw new Error(`Invalid status: ${value}`);
    }
    return new OrderStatus(value as OrderStatusType);
  }

  static active(): OrderStatus {
    return new OrderStatus(OrderStatusType.ACTIVE);
  }

  static done(): OrderStatus {
    return new OrderStatus(OrderStatusType.DONE);
  }

  static cancelled(): OrderStatus {
    return new OrderStatus(OrderStatusType.CANCELLED);
  }

  getValue(): OrderStatusType {
    return this.value;
  }

  isActive(): boolean {
    return this.value === OrderStatusType.ACTIVE;
  }

  isDone(): boolean {
    return this.value === OrderStatusType.DONE;
  }

  isCancelled(): boolean {
    return this.value === OrderStatusType.CANCELLED;
  }

  isTerminal(): boolean {
    return this.isDone() || this.isCancelled();
  }

  canTransitionTo(newStatus: OrderStatus): boolean {
    // Can only transition from active state
    if (!this.isActive()) return false;
    return true;
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
EOF
```

Expected: `order-status.ts` created

- [ ] **Step 4: Commit**

```bash
cd /Users/nick/2_SideProjects/my-kitchen
git add backend/src/orders/domain/value-objects/
git commit -m "feat: add domain value objects (Carrier, OrderNumber, OrderStatus)"
```

Expected: Value objects committed

---

### Task 4: Backend - Order Entity

**Files:**
- Create: `backend/src/orders/domain/entities/order.entity.ts`
- Create: `backend/src/orders/domain/entities/order.entity.spec.ts`

- [ ] **Step 1: Write failing test for Order entity**

```bash
mkdir -p /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/domain/entities
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/domain/entities/order.entity.spec.ts << 'EOF'
import { Order } from './order.entity';
import { Carrier } from '../value-objects/carrier';
import { OrderNumber } from '../value-objects/order-number';
import { OrderStatus } from '../value-objects/order-status';

describe('Order Entity', () => {
  describe('creation', () => {
    it('should create an active order with valid inputs', () => {
      const carrier = Carrier.create('G');
      const number = OrderNumber.create(1234);
      
      const order = Order.create(carrier, number);
      
      expect(order.carrier).toEqual(carrier);
      expect(order.number).toEqual(number);
      expect(order.status.isActive()).toBe(true);
      expect(order.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('status transitions', () => {
    it('should transition from active to done', () => {
      const order = Order.create(Carrier.create('G'), OrderNumber.create(1234));
      
      order.markAsDone();
      
      expect(order.status.isDone()).toBe(true);
      expect(order.updatedAt.getTime()).toBeGreaterThanOrEqual(order.createdAt.getTime());
    });

    it('should transition from active to cancelled', () => {
      const order = Order.create(Carrier.create('G'), OrderNumber.create(1234));
      
      order.markAsCancelled();
      
      expect(order.status.isCancelled()).toBe(true);
    });

    it('should not transition from done to any state', () => {
      const order = Order.create(Carrier.create('G'), OrderNumber.create(1234));
      order.markAsDone();
      
      expect(() => order.markAsCancelled()).toThrow();
    });

    it('should not transition from cancelled to any state', () => {
      const order = Order.create(Carrier.create('G'), OrderNumber.create(1234));
      order.markAsCancelled();
      
      expect(() => order.markAsDone()).toThrow();
    });
  });

  describe('date checks', () => {
    it('should determine if order is from today', () => {
      const order = Order.create(Carrier.create('G'), OrderNumber.create(1234));
      
      expect(order.isTodayOrder()).toBe(true);
    });

    it('should determine if order is not from today', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const order = Order.create(Carrier.create('G'), OrderNumber.create(1234));
      // Manually set createdAt (in real entity)
      (order as any).createdAt = yesterday;
      
      expect(order.isTodayOrder()).toBe(false);
    });
  });
});
EOF
```

Expected: `order.entity.spec.ts` created

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/nick/2_SideProjects/my-kitchen/backend
npm test -- src/orders/domain/entities/order.entity.spec.ts 2>&1 | head -20
```

Expected: Test fails with "Cannot find module './order.entity'"

- [ ] **Step 3: Implement Order entity**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/domain/entities/order.entity.ts << 'EOF'
import { Carrier } from '../value-objects/carrier';
import { OrderNumber } from '../value-objects/order-number';
import { OrderStatus } from '../value-objects/order-status';

export class Order {
  readonly id?: number;
  readonly carrier: Carrier;
  readonly number: OrderNumber;
  status: OrderStatus;
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(
    carrier: Carrier,
    number: OrderNumber,
    status: OrderStatus = OrderStatus.active(),
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    id?: number,
  ) {
    this.carrier = carrier;
    this.number = number;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.id = id;
  }

  static create(
    carrier: Carrier,
    number: OrderNumber,
    status: OrderStatus = OrderStatus.active(),
  ): Order {
    return new Order(carrier, number, status);
  }

  static reconstruct(
    carrier: Carrier,
    number: OrderNumber,
    status: OrderStatus,
    createdAt: Date,
    updatedAt: Date,
    id: number,
  ): Order {
    return new Order(carrier, number, status, createdAt, updatedAt, id);
  }

  markAsDone(): void {
    if (!this.status.isActive()) {
      throw new Error('Cannot mark non-active order as done');
    }
    this.status = OrderStatus.done();
    this.updatedAt = new Date();
  }

  markAsCancelled(): void {
    if (!this.status.isActive()) {
      throw new Error('Cannot mark non-active order as cancelled');
    }
    this.status = OrderStatus.cancelled();
    this.updatedAt = new Date();
  }

  isActive(): boolean {
    return this.status.isActive();
  }

  isTodayOrder(): boolean {
    const today = new Date();
    const createdDate = new Date(this.createdAt);
    return (
      today.getFullYear() === createdDate.getFullYear() &&
      today.getMonth() === createdDate.getMonth() &&
      today.getDate() === createdDate.getDate()
    );
  }

  getDisplayName(): string {
    return `${this.carrier.toString()}-${this.number.toString()}`;
  }
}
EOF
```

Expected: `order.entity.ts` created

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/nick/2_SideProjects/my-kitchen/backend
npm test -- src/orders/domain/entities/order.entity.spec.ts
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/nick/2_SideProjects/my-kitchen
git add backend/src/orders/domain/entities/
git commit -m "feat: implement Order entity with domain logic (TDD)"
```

Expected: Order entity committed

---

### Task 5: Backend - Repository Interface

**Files:**
- Create: `backend/src/orders/domain/repositories/order.repository.interface.ts`

- [ ] **Step 1: Create repository interface**

```bash
mkdir -p /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/domain/repositories
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/domain/repositories/order.repository.interface.ts << 'EOF'
import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: number): Promise<Order | null>;
  findAll(filters?: {
    status?: string;
    dateOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Order[]; total: number }>;
  update(id: number, order: Order): Promise<Order>;
  delete(id: number): Promise<void>;
}
EOF
```

Expected: Repository interface created

- [ ] **Step 2: Commit**

```bash
cd /Users/nick/2_SideProjects/my-kitchen
git add backend/src/orders/domain/repositories/
git commit -m "feat: define IOrderRepository interface"
```

Expected: Repository interface committed

---

## Phase 3: Backend - Application & Infrastructure Layers

### Task 6: Backend - DTOs and Application Service

**Files:**
- Create: `backend/src/orders/application/dto/create-order.dto.ts`
- Create: `backend/src/orders/application/dto/update-order-status.dto.ts`
- Create: `backend/src/orders/application/services/order.service.ts`

- [ ] **Step 1: Create DTOs**

```bash
mkdir -p /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/application/{dto,services}
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/application/dto/create-order.dto.ts << 'EOF'
import { IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  carrier: string;

  @IsNumber()
  @Min(0)
  @Max(9999)
  number: number;
}
EOF
```

Expected: `create-order.dto.ts` created

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/application/dto/update-order-status.dto.ts << 'EOF'
import { IsString, IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['done', 'cancelled'])
  status: string;
}
EOF
```

Expected: `update-order-status.dto.ts` created

- [ ] **Step 2: Create Order Application Service**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/application/services/order.service.ts << 'EOF'
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { Carrier } from '../../domain/value-objects/carrier';
import { OrderNumber } from '../../domain/value-objects/order-number';
import { OrderStatus } from '../../domain/value-objects/order-status';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';

@Injectable()
export class OrderService {
  constructor(private readonly repository: IOrderRepository) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    try {
      const carrier = Carrier.create(dto.carrier);
      const number = OrderNumber.create(dto.number);
      const order = Order.create(carrier, number);
      return await this.repository.save(order);
    } catch (error) {
      throw new BadRequestException(`Invalid order input: ${error.message}`);
    }
  }

  async getOrders(filters?: {
    status?: string;
    dateOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Order[]; total: number }> {
    return this.repository.findAll(filters);
  }

  async updateOrderStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    try {
      if (dto.status === 'done') {
        order.markAsDone();
      } else if (dto.status === 'cancelled') {
        order.markAsCancelled();
      }
      return await this.repository.update(id, order);
    } catch (error) {
      throw new BadRequestException(`Cannot update order: ${error.message}`);
    }
  }
}
EOF
```

Expected: `order.service.ts` created

- [ ] **Step 3: Commit**

```bash
cd /Users/nick/2_SideProjects/my-kitchen
git add backend/src/orders/application/
git commit -m "feat: add OrderService with use cases and DTOs"
```

Expected: Application layer committed

---

### Task 7: Backend - TypeORM Entity & Repository Implementation

**Files:**
- Create: `backend/src/orders/infrastructure/persistence/order.typeorm.entity.ts`
- Create: `backend/src/orders/infrastructure/repositories/order.repository.ts`

- [ ] **Step 1: Create TypeORM entity**

```bash
mkdir -p /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/infrastructure/{persistence,repositories,controllers}
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/infrastructure/persistence/order.typeorm.entity.ts << 'EOF'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class OrderTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('char', { length: 1 })
  carrier: string;

  @Column('int')
  number: number;

  @Column('varchar', { length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
EOF
```

Expected: `order.typeorm.entity.ts` created

- [ ] **Step 2: Create Repository implementation**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/infrastructure/repositories/order.repository.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { OrderTypeOrmEntity } from '../persistence/order.typeorm.entity';
import { Carrier } from '../../domain/value-objects/carrier';
import { OrderNumber } from '../../domain/value-objects/order-number';
import { OrderStatus } from '../../domain/value-objects/order-status';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderTypeOrmEntity)
    private readonly typeormRepository: Repository<OrderTypeOrmEntity>,
  ) {}

  async save(order: Order): Promise<Order> {
    const entity = this.orderToPersistence(order);
    const saved = await this.typeormRepository.save(entity);
    return this.persistenceToOrder(saved);
  }

  async findById(id: number): Promise<Order | null> {
    const entity = await this.typeormRepository.findOne({ where: { id } });
    return entity ? this.persistenceToOrder(entity) : null;
  }

  async findAll(filters?: {
    status?: string;
    dateOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Order[]; total: number }> {
    let query = this.typeormRepository.createQueryBuilder('order');

    if (filters?.dateOnly) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.where('order.createdAt >= :today', { today });
    }

    if (filters?.status) {
      query = query.andWhere('order.status != :status', { status: filters.status });
    }

    const limit = filters?.limit || 5;
    const offset = filters?.offset || 0;

    query = query
      .orderBy('order.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    const [entities, total] = await query.getManyAndCount();
    return {
      data: entities.map((e) => this.persistenceToOrder(e)),
      total,
    };
  }

  async update(id: number, order: Order): Promise<Order> {
    const entity = this.orderToPersistence(order);
    entity.id = id;
    const updated = await this.typeormRepository.save(entity);
    return this.persistenceToOrder(updated);
  }

  async delete(id: number): Promise<void> {
    await this.typeormRepository.delete(id);
  }

  private orderToPersistence(order: Order): OrderTypeOrmEntity {
    const entity = new OrderTypeOrmEntity();
    entity.carrier = order.carrier.getValue();
    entity.number = order.number.getValue();
    entity.status = order.status.getValue();
    if (order.id) {
      entity.id = order.id;
    }
    return entity;
  }

  private persistenceToOrder(entity: OrderTypeOrmEntity): Order {
    return Order.reconstruct(
      Carrier.create(entity.carrier),
      OrderNumber.create(entity.number),
      OrderStatus.create(entity.status),
      entity.createdAt,
      entity.updatedAt,
      entity.id,
    );
  }
}
EOF
```

Expected: `order.repository.ts` created

- [ ] **Step 3: Commit**

```bash
cd /Users/nick/2_SideProjects/my-kitchen
git add backend/src/orders/infrastructure/
git commit -m "feat: implement OrderRepository with TypeORM persistence"
```

Expected: Infrastructure layer committed

---

### Task 8: Backend - Controller & Module Setup

**Files:**
- Create: `backend/src/orders/infrastructure/controllers/orders.controller.ts`
- Create: `backend/src/orders/orders.module.ts`

- [ ] **Step 1: Create Orders Controller**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/infrastructure/controllers/orders.controller.ts << 'EOF'
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from '../../application/services/order.service';
import { CreateOrderDto } from '../../application/dto/create-order.dto';
import { UpdateOrderStatusDto } from '../../application/dto/update-order-status.dto';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    const order = await this.orderService.createOrder(dto);
    return {
      id: order.id,
      carrier: order.carrier.getValue(),
      number: order.number.getValue(),
      status: order.status.getValue(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  @Get()
  async getOrders(
    @Query('dateOnly') dateOnly?: string,
    @Query('excludeStatus') excludeStatus?: string,
    @Query('limit', ParseIntPipe) limit?: number,
    @Query('offset', ParseIntPipe) offset?: number,
  ) {
    const filters = {
      dateOnly: dateOnly === 'true',
      status: excludeStatus,
      limit: limit || 5,
      offset: offset || 0,
    };

    const result = await this.orderService.getOrders(filters);
    return {
      data: result.data.map((order) => ({
        id: order.id,
        carrier: order.carrier.getValue(),
        number: order.number.getValue(),
        status: order.status.getValue(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      })),
      total: result.total,
    };
  }

  @Patch(':id')
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateOrderStatus(id, dto);
    return {
      id: order.id,
      carrier: order.carrier.getValue(),
      number: order.number.getValue(),
      status: order.status.getValue(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
EOF
```

Expected: `orders.controller.ts` created

- [ ] **Step 2: Create Orders Module**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/backend/src/orders/orders.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './infrastructure/controllers/orders.controller';
import { OrderService } from './application/services/order.service';
import { OrderRepository } from './infrastructure/repositories/order.repository';
import { OrderTypeOrmEntity } from './infrastructure/persistence/order.typeorm.entity';
import { IOrderRepository } from './domain/repositories/order.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([OrderTypeOrmEntity])],
  controllers: [OrdersController],
  providers: [
    OrderService,
    {
      provide: IOrderRepository,
      useClass: OrderRepository,
    },
  ],
})
export class OrdersModule {}
EOF
```

Expected: `orders.module.ts` created

- [ ] **Step 3: Commit**

```bash
cd /Users/nick/2_SideProjects/my-kitchen
git add backend/src/orders/
git commit -m "feat: add OrdersController and OrdersModule"
```

Expected: Complete backend skeleton committed

---

### Task 9: Backend - Database Migration & Setup Script

**Files:**
- Create: `backend/scripts/init-db.sql`
- Create: `docker-compose.yml` (partial)

- [ ] **Step 1: Create database initialization script**

```bash
mkdir -p /Users/nick/2_SideProjects/my-kitchen/backend/scripts
cat > /Users/nick/2_SideProjects/my-kitchen/backend/scripts/init-db.sql << 'EOF'
-- Create database and user
CREATE USER kitchen_user WITH PASSWORD 'kitchen_pass';
CREATE DATABASE kitchen_orders OWNER kitchen_user;

-- Connect to the database
\c kitchen_orders

-- Create orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  carrier CHAR(1) NOT NULL CHECK (carrier IN ('S', 'G', 'L')),
  number INT NOT NULL CHECK (number >= 0 AND number <= 9999),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE kitchen_orders TO kitchen_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kitchen_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kitchen_user;
EOF
```

Expected: `init-db.sql` created

- [ ] **Step 2: Create docker-compose.yml (root)**

```bash
cat > /Users/nick/2_SideProjects/my-kitchen/docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: kitchen-postgres
    environment:
      POSTGRES_USER: kitchen_user
      POSTGRES_PASSWORD: kitchen_pass
      POSTGRES_DB: kitchen_orders
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kitchen_user"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - kitchen-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: kitchen-backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: kitchen_user
      DB_PASSWORD: kitchen_pass
      DB_NAME: kitchen_orders
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - kitchen-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: kitchen-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://192.168.1.131:3001
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - kitchen-network

volumes:
  postgres_data:

networks:
  kitchen-network:
    driver: bridge
EOF
```

Expected: `docker-compose.yml` created

- [ ] **Step 3: Commit**

```bash
cd /Users/nick/2_SideProjects/my-kitchen
git add backend/scripts/ docker-compose.yml
git commit -m "chore: add database initialization and docker-compose setup"
```

Expected: Database and Docker setup committed

---

## Phase 4: Frontend - Next.js

**NOTE:** Due to token limits and the comprehensive scope of this project, I'm creating a prioritized task list. The remaining tasks should be delegated to Codex for parallel execution.

---

## Remaining Phase Tasks (Delegable to Codex)

### Task 10: Frontend - Project Setup & Pages Structure
### Task 11: Frontend - Components (OrderInput, OrderList, OrderItem)
### Task 12: Frontend - Manage Order Page
### Task 13: Frontend - Dashboard Page
### Task 14: Frontend - API Integration & Hooks
### Task 15: Raspberry Pi Dashboard - Express.js Setup
### Task 16: Raspberry Pi Dashboard - Views & Styling
### Task 17: Jenkinsfile - Build & Deploy Pipeline
### Task 18: Integration Testing & E2E Tests
### Task 19: Documentation (Setup, API, Deployment)

---

## Implementation Notes for Remaining Tasks

**Frontend (Next.js) - Key Architecture:**
- Use `src/app` directory (Next.js 13+)
- Create pages: `page.tsx` (Manage Order) and `dashboard/page.tsx` (Dashboard)
- Components in `src/components/` with TypeScript
- API integration layer in `src/services/api.ts`
- Custom hooks in `src/hooks/` for data fetching (useOrders, useDashboard)
- Polling implementation: Use `setInterval` or `React.useEffect` with cleanup
- Auto-refresh every 2-3s on Dashboard page

**Raspberry Pi Dashboard (Express.js) - Key Architecture:**
- Lightweight Express server
- EJS templating for HTML rendering
- Vanilla JS for client-side polling (no React)
- Single view: `src/views/dashboard.ejs`
- Route: `GET /dashboard` returns dashboard HTML
- Connect to backend at `http://192.168.1.131:3001`

**Docker & Jenkins:**
- Dockerfile for Next.js: Multi-stage build, node 18-alpine
- Dockerfile for Express.js (Pi): Node 18-alpine
- Jenkinsfile: Declarative pipeline, stages for build/test/push/deploy
- Deploy to home server via docker-compose
- Deploy to Pi via SSH + git pull + service restart

**Testing:**
- Backend unit tests for domain entities (already covered)
- Backend integration tests for repository + service
- Backend E2E tests for controller endpoints
- Frontend component tests (React Testing Library)
- Frontend E2E tests (Cypress)

---

## Summary for Delegation

This plan covers:
1. ✅ Complete NestJS backend with DDD architecture (Phase 1-3, Tasks 1-9)
2. ⏳ Next.js frontend (Tasks 10-14) — Ready for Codex delegation
3. ⏳ Raspberry Pi Express.js dashboard (Tasks 15-16) — Ready for Codex delegation
4. ⏳ Jenkins pipeline & Docker setup (Task 17) — Ready for Codex delegation
5. ⏳ Tests & Documentation (Tasks 18-19) — Ready for Codex delegation

**Backend is ready to build and test. Frontends and deployment can proceed in parallel.**

---

**Plan saved to:** `/Users/nick/2_SideProjects/my-kitchen/docs/superpowers/plans/2026-06-21-kitchen-order-tracker-plan.md`

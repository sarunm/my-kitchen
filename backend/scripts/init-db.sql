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

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  carrier CHAR(1) NOT NULL CHECK (carrier IN ('S', 'G', 'L')),
  number INT NOT NULL CHECK (number >= 0 AND number <= 9999),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done', 'closed', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

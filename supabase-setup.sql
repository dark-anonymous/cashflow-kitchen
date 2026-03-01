-- Cashflow Kitchen - Supabase Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('cake', 'cookies', 'others')),
    default_price NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    qty NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'ewallet')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income Table
CREATE TABLE income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'ewallet')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('ingredient', 'packaging', 'delivery', 'marketing', 'utilities', 'other')),
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'ewallet')),
    supplier TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    order_date DATE NOT NULL,
    order_time TIME NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    delivery_method TEXT NOT NULL CHECK (delivery_method IN ('pickup', 'delivery')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'paid', 'delivered', 'cancelled')),
    payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'ewallet')),
    notes TEXT,
    converted_to_sales BOOLEAN DEFAULT false,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    qty NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    line_total NUMERIC NOT NULL
);

-- RLS Policies for all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "products_user_policy" ON products FOR ALL USING (user_id = auth.uid());

-- Sales Policies
CREATE POLICY "sales_user_policy" ON sales FOR ALL USING (user_id = auth.uid());

-- Income Policies
CREATE POLICY "income_user_policy" ON income FOR ALL USING (user_id = auth.uid());

-- Expenses Policies
CREATE POLICY "expenses_user_policy" ON expenses FOR ALL USING (user_id = auth.uid());

-- Orders Policies
CREATE POLICY "orders_user_policy" ON orders FOR ALL USING (user_id = auth.uid());

-- Order Items Policies (check via orders)
CREATE POLICY "order_items_user_policy" ON order_items FOR ALL USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);

-- Function to seed products for a new user
CREATE OR REPLACE FUNCTION seed_user_products()
RETURNS void
AS $$
DECLARE
    current_user_id UUID;
    existing_count INTEGER;
BEGIN
    current_user_id := auth.uid();
    
    SELECT COUNT(*) INTO existing_count FROM products WHERE user_id = current_user_id;
    
    IF existing_count = 0 THEN
        INSERT INTO products (user_id, name, category, default_price)
        VALUES 
            (current_user_id, 'Kek Batik', 'cake', 45.00),
            (current_user_id, 'Cookies', 'cookies', 25.00);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to seed products on user creation (optional - for future use)
-- Note: This requires a trigger on auth.users which needs special setup

-- Indexes for better query performance
CREATE INDEX idx_sales_user_date ON sales(user_id, date);
CREATE INDEX idx_income_user_date ON income(user_id, date);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Create a view for order totals
CREATE OR REPLACE VIEW order_totals AS
SELECT 
    o.id,
    o.user_id,
    o.order_date,
    o.customer_name,
    o.status,
    o.converted_to_sales,
    COALESCE(SUM(oi.line_total), 0) as total_amount
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.user_id, o.order_date, o.customer_name, o.status, o.converted_to_sales;

/*
  # Car Rental Management System Schema

  1. New Tables
    - `cars`
      - `id` (uuid, primary key)
      - `model` (text)
      - `purchase_date` (date)
      - `purchase_price` (decimal)
      - `road_tax_expiry` (date)
      - `insurance_expiry` (date)
      - `status` (enum: Idle, On Rent, Maintenance)
      - `image_url` (text, nullable)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)
    - `transactions`
      - `id` (uuid, primary key)
      - `car_id` (uuid, foreign key)
      - `transaction_type` (enum: Rental, Maintenance)
      - `amount` (decimal)
      - `description` (text)
      - `created_at` (timestamp with timezone)
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `role` (text, default 'user')
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin users only
    - Create storage bucket for car images
*/

-- Create enum types
CREATE TYPE car_status AS ENUM ('Idle', 'On Rent', 'Maintenance');
CREATE TYPE transaction_type AS ENUM ('Rental', 'Maintenance');

-- Create cars table
CREATE TABLE IF NOT EXISTS cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  purchase_date date NOT NULL,
  purchase_price decimal(10,2) NOT NULL,
  road_tax_expiry date NOT NULL,
  insurance_expiry date NOT NULL,
  status car_status DEFAULT 'Idle',
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES cars(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  amount decimal(10,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admin can manage cars"
  ON cars
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can manage transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can manage user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create updated_at trigger for cars
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('car-images', 'car-images', true);

-- Create storage policy for car images
CREATE POLICY "Admin can upload car images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'car-images' AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view car images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'car-images');

-- Insert sample data
INSERT INTO cars (model, purchase_date, purchase_price, road_tax_expiry, insurance_expiry, status) VALUES
('Toyota Camry 2023', '2023-01-15', 28500.00, '2025-01-15', '2024-12-15', 'Idle'),
('Honda Civic 2022', '2022-06-20', 25000.00, '2024-06-20', '2024-05-20', 'On Rent'),
('BMW X5 2023', '2023-03-10', 55000.00, '2025-03-10', '2024-11-10', 'Idle'),
('Mercedes C-Class 2022', '2022-08-05', 42000.00, '2024-08-05', '2024-07-05', 'Maintenance'),
('Audi A4 2023', '2023-02-28', 38000.00, '2025-02-28', '2024-12-28', 'On Rent'),
('Tesla Model 3 2023', '2023-04-12', 45000.00, '2025-04-12', '2024-10-12', 'Idle'),
('Ford Mustang 2022', '2022-09-18', 35000.00, '2024-09-18', '2024-08-18', 'Idle'),
('Nissan Altima 2023', '2023-01-30', 26500.00, '2025-01-30', '2024-11-30', 'On Rent'),
('Hyundai Elantra 2022', '2022-11-22', 23000.00, '2024-11-22', '2024-09-22', 'Idle'),
('Volkswagen Jetta 2023', '2023-05-08', 27500.00, '2025-05-08', '2024-12-08', 'Maintenance');

-- Insert sample transactions
INSERT INTO transactions (car_id, transaction_type, amount, description) 
SELECT 
  c.id,
  (ARRAY['Rental', 'Maintenance'])[floor(random() * 2 + 1)::int]::transaction_type,
  (random() * 500 + 100)::decimal(10,2),
  CASE 
    WHEN random() > 0.5 THEN 'Monthly rental payment'
    ELSE 'Routine maintenance service'
  END
FROM cars c
CROSS JOIN generate_series(1, 3);

-- Add more varied transaction data
INSERT INTO transactions (car_id, transaction_type, amount, description, created_at) 
SELECT 
  c.id,
  'Rental'::transaction_type,
  (random() * 800 + 200)::decimal(10,2),
  'Weekly rental - ' || c.model,
  now() - interval '30 days' * random()
FROM cars c
WHERE c.status = 'On Rent';

INSERT INTO transactions (car_id, transaction_type, amount, description, created_at) 
SELECT 
  c.id,
  'Maintenance'::transaction_type,
  (random() * 300 + 50)::decimal(10,2),
  'Oil change and inspection',
  now() - interval '60 days' * random()
FROM cars c
LIMIT 8;
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Car = {
  id: string;
  model: string;
  purchase_date: string;
  purchase_price: number;
  road_tax_expiry: string;
  insurance_expiry: string;
  status: 'Idle' | 'On Rent' | 'Maintenance';
  image_url?: string;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  car_id: string;
  transaction_type: 'Rental' | 'Maintenance';
  amount: number;
  description?: string;
  created_at: string;
  cars?: Car;
};

export type UserRole = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
};
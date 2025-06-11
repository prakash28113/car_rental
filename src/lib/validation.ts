import { z } from 'zod';

export const carSchema = z.object({
  model: z.string().min(1, 'Model is required').max(100, 'Model too long'),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  purchase_price: z.number().min(0, 'Price must be positive'),
  road_tax_expiry: z.string().min(1, 'Road tax expiry is required'),
  insurance_expiry: z.string().min(1, 'Insurance expiry is required'),
  status: z.enum(['Idle', 'On Rent', 'Maintenance']),
});

export const transactionSchema = z.object({
  car_id: z.string().min(1, 'Car is required'),
  transaction_type: z.enum(['Rental', 'Maintenance']),
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type CarFormData = z.infer<typeof carSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
/*
  # Create Admin User and Role

  1. New User Creation
    - Creates an admin user with email: admin@carrental.com
    - Sets password to: admin123
    - Confirms the email automatically

  2. Role Assignment
    - Assigns 'admin' role to the created user in user_roles table
    - Links the user to the admin role for proper access control

  3. Security
    - Uses Supabase's built-in auth system
    - Maintains RLS policies for user_roles table
*/

-- Insert admin user into auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@carrental.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Insert admin role for the created user
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@carrental.com';
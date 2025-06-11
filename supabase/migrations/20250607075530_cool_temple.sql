/*
  # Update Admin Password

  1. Changes
    - Update the admin user password to "Mahesh@127"
    - Ensure the admin user exists and has proper role assignment
*/

-- Update the admin user password
UPDATE auth.users 
SET encrypted_password = crypt('Mahesh@127', gen_salt('bf'))
WHERE email = 'admin@carrental.com';

-- Ensure admin role exists for this user (in case it was missing)
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@carrental.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.users.id AND role = 'admin'
);
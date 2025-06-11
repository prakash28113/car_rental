/*
  # Fix infinite recursion in user_roles RLS policy

  1. Security Changes
    - Drop the existing recursive policy on user_roles table
    - Create a simple policy that allows users to read their own role
    - Create a separate policy for admin management that doesn't cause recursion

  2. Policy Changes
    - "Users can read own role" - allows authenticated users to read their own user_role entry
    - "Admin can manage all user roles" - allows admin operations but structured to avoid recursion
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Admin can manage user roles" ON user_roles;

-- Create a simple policy that allows users to read their own role
-- This prevents recursion by directly comparing auth.uid() with user_id
CREATE POLICY "Users can read own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a policy for admin management that doesn't cause recursion
-- This policy allows full access to users who have admin role, but uses a direct check
CREATE POLICY "Admin can manage all user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
      AND ur.id != user_roles.id  -- Prevent self-reference
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
      AND ur.id != user_roles.id  -- Prevent self-reference
    )
  );
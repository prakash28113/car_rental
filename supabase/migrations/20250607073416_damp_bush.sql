/*
  # Fix infinite recursion in user_roles RLS policies

  1. Policy Changes
    - Drop the existing problematic "Admin can manage all user roles" policy
    - Create a new simplified admin policy that doesn't cause recursion
    - Keep the existing "Users can read own role" policy as it's working correctly

  2. Security
    - Maintain proper access control for admin users
    - Ensure users can still read their own roles
    - Prevent infinite recursion by avoiding self-referential queries in policies
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admin can manage all user roles" ON user_roles;

-- Create a new admin policy that doesn't reference user_roles table in its condition
-- This policy allows full access to users who have the admin role
-- We'll use a function to check admin status without causing recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user has admin role
  -- We use a direct query with LIMIT to avoid recursion
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simpler admin policy that uses the function
CREATE POLICY "Admin full access to user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Ensure the user can read their own role policy still exists
-- (This should already exist and work correctly)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' 
    AND policyname = 'Users can read own role'
  ) THEN
    CREATE POLICY "Users can read own role"
      ON user_roles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
-- Add RLS policies for users table
-- This migration adds Row Level Security policies to allow users to manage their own profiles

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT
  USING (auth.uid()::text = clerk_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users FOR UPDATE
  USING (auth.uid()::text = clerk_id)
  WITH CHECK (auth.uid()::text = clerk_id);

-- Allow users to insert their own profile (for initial signup)
CREATE POLICY "Users can insert own profile" ON users FOR INSERT
  WITH CHECK (auth.uid()::text = clerk_id);

-- Allow authenticated users to read basic user information (for league members, etc.)
CREATE POLICY "Authenticated users can view basic user info" ON users FOR SELECT
  TO authenticated
  USING (true);
-- Apply RLS policies for vehicles table
-- This script adds the necessary Row Level Security policies for the vehicles table

-- Enable RLS on vehicles table if not already enabled
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Drivers can read their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Drivers can insert their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Drivers can update their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Drivers can delete their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admins can manage all vehicles" ON vehicles;

-- Create policies for vehicles table
CREATE POLICY "Drivers can read their own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can insert their own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can delete their own vehicles"
  ON vehicles FOR DELETE
  USING (auth.uid() = driver_id);

-- Admins can manage all vehicles
CREATE POLICY "Admins can manage all vehicles"
  ON vehicles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Migration: Add water_reminder_interval column to user_profiles table
-- Description: Adds the missing water_reminder_interval column that the registration system expects
-- Date: 2024-12-21

-- Add the water_reminder_interval column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS water_reminder_interval INTEGER DEFAULT 2;

-- Add a comment to document the column
COMMENT ON COLUMN user_profiles.water_reminder_interval IS 'Water reminder interval in hours (default: 2 hours)';

-- Update existing records to have a default value (if any exist)
UPDATE user_profiles 
SET water_reminder_interval = 2 
WHERE water_reminder_interval IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE user_profiles 
ALTER COLUMN water_reminder_interval SET NOT NULL;

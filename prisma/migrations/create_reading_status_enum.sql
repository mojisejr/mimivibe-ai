-- Migration: Create reading_status enum type
-- Date: 2025-09-27
-- Purpose: Add reading_status enum for async reading status tracking

-- Create the reading_status enum type
CREATE TYPE reading_status AS ENUM (
    'pending',
    'processing', 
    'completed',
    'failed'
);

-- Add status column to readings table with default value
ALTER TABLE readings 
ADD COLUMN status reading_status DEFAULT 'completed';

-- Create index for better query performance
CREATE INDEX idx_readings_status ON readings(status);

-- Update existing readings to have 'completed' status (they are already processed)
UPDATE readings SET status = 'completed' WHERE status IS NULL;
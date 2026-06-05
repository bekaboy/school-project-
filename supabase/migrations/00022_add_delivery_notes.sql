-- Add delivery_notes column to track driver's delivery notes
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

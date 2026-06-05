-- Make batch_id nullable in order_items so orders can be created without selecting a specific batch
ALTER TABLE order_items ALTER COLUMN batch_id DROP NOT NULL;

-- Add missing indexes on FK columns to improve JOIN performance.

-- order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_batch_id   ON order_items(batch_id);

-- invoices
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);

-- deliveries
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id   ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id  ON deliveries(driver_id);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_order_id     ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_verified_by  ON payments(verified_by);

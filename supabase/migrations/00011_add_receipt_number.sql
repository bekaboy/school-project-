ALTER TABLE payments ADD COLUMN receipt_number TEXT;

CREATE INDEX idx_payments_receipt_number ON payments(receipt_number);

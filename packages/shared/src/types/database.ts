import type { UserRole } from './domain';

export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProduct {
  id: string;
  product_id: string;
  generic_name: string;
  brand_name: string;
  strength: string;
  dosage_form: string;
  pack_size: string;
  manufacturer: string;
  country_of_origin: string;
  unit_of_measure: string;
  category: string;
  cost_price: number;
  selling_price: number;
  tax_rate: number;
  reorder_quantity: number;
  storage_requirements: string | null;
  active_status: boolean;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbBatch {
  id: string;
  product_id: string;
  batch_number: string;
  expiry_date: string;
  manufacturing_date: string;
  quantity_received: number;
  quantity_remaining: number;
  supplier: string;
  date_received: string;
  batch_status: 'Active' | 'Expired' | 'Quarantined';
  created_at: string;
  updated_at: string;
}

export interface DbCustomer {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string;
  alternate_phone: string | null;
  email: string | null;
  address: string | null;
  tax_id: string | null;
  license_number: string | null;
  payment_terms: string | null;
  credit_limit: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbSalesOrder {
  id: string;
  order_id: string;
  customer_id: string;
  sales_rep_id: string;
  order_date: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  delivery_address: string | null;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  batch_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface DbInvoice {
  id: string;
  invoice_number: string;
  order_id: string;
  invoice_date: string;
  pdf_url: string | null;
  created_at: string;
}

export interface DbPayment {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  proof_url: string | null;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDelivery {
  id: string;
  order_id: string;
  driver_id: string | null;
  status: string;
  assigned_at: string | null;
  delivered_at: string | null;
  recipient_name: string | null;
  failure_reason: string | null;
  delivery_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

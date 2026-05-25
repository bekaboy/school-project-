export const ORDER_STATUS = {
  DRAFT: 'Draft',
  PROFORMA_GENERATED: 'Proforma Generated',
  PENDING_PAYMENT: 'Pending Payment',
  VERIFIED: 'Verified',
  INVOICE_GENERATED: 'Invoice Generated',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  RESCHEDULED: 'Rescheduled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  UPLOADED: 'Uploaded',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
} as const;

export const DELIVERY_STATUS = {
  ASSIGNED: 'Assigned',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  RESCHEDULED: 'Rescheduled',
  CANCELLED: 'Cancelled',
} as const;

export const BATCH_STATUS = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  QUARANTINED: 'Quarantined',
} as const;

export const USER_ROLES = {
  SALES_REP: 'Sales Representative',
  STORE_MANAGER: 'Store Manager',
  FINANCE_OFFICER: 'Finance Officer',
  DELIVERY_DRIVER: 'Delivery Driver',
  TECH_MANAGER: 'Technical Manager/Owner',
} as const;

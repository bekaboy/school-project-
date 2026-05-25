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

export const STATUS_COLORS: Record<string, string> = {
  [ORDER_STATUS.DRAFT]: 'status-yellow',
  [ORDER_STATUS.DELIVERED]: 'status-green',
  [ORDER_STATUS.CANCELLED]: 'status-red',
  [ORDER_STATUS.FAILED]: 'status-red',
  [PAYMENT_STATUS.VERIFIED]: 'status-green',
  [PAYMENT_STATUS.REJECTED]: 'status-red',
  [BATCH_STATUS.EXPIRED]: 'status-red',
  [BATCH_STATUS.ACTIVE]: 'status-green',
} as const;

export const EXPIRY_WARNING_DAYS = 90;
export const SESSION_TIMEOUT_MINUTES = 30;
export const PAGE_SIZE = 25;

export type UserRole =
  | 'Sales Representative'
  | 'Store Manager'
  | 'Finance Officer'
  | 'Delivery Driver'
  | 'Technical Manager/Owner';

export type OrderStatus =
  | 'Draft'
  | 'Proforma Generated'
  | 'Pending Payment'
  | 'Verified'
  | 'Invoice Generated'
  | 'In Transit'
  | 'Delivered'
  | 'Cancelled'
  | 'Failed'
  | 'Rescheduled';

export type PaymentStatus =
  | 'Pending'
  | 'Uploaded'
  | 'Verified'
  | 'Rejected'
  | 'Completed';

export type DeliveryStatus =
  | 'Assigned'
  | 'In Transit'
  | 'Delivered'
  | 'Failed'
  | 'Rescheduled'
  | 'Cancelled';

export type BatchStatus = 'Active' | 'Expired' | 'Quarantined';

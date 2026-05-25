import type { UserRole } from '@pharma-ims/shared';

type PermissionMap = Record<UserRole, string[]>;

const PERMISSIONS: PermissionMap = {
  'Sales Representative': [
    'order:create', 'order:view-own', 'order:cancel',
    'product:view', 'customer:view', 'proforma:generate',
  ],
  'Store Manager': [
    'product:manage', 'batch:manage', 'inventory:view',
    'inventory:adjust', 'customer:manage',
    'alert:view-expiry', 'alert:view-low-stock',
  ],
  'Finance Officer': [
    'payment:verify', 'payment:reject', 'payment:view',
    'receipt:generate', 'invoice:view',
  ],
  'Delivery Driver': [
    'delivery:view-assigned', 'delivery:update-status',
    'delivery:view-history',
  ],
  'Technical Manager/Owner': [
    'order:create', 'order:view-all', 'order:cancel',
    'product:manage', 'batch:manage', 'inventory:view',
    'inventory:adjust', 'customer:manage',
    'payment:verify', 'payment:view', 'receipt:generate',
    'delivery:assign', 'delivery:view-all',
    'report:view', 'report:export',
    'user:manage', 'settings:manage', 'dashboard:view',
    'alert:view-expiry', 'alert:view-low-stock',
    'proforma:generate', 'invoice:view',
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getAllPermissions(role: UserRole): string[] {
  return PERMISSIONS[role] ?? [];
}

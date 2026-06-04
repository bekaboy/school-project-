import { describe, it, expect } from 'vitest';
import { hasPermission, getAllPermissions } from '@/lib/utils/permissions';
import type { UserRole } from '@pharma-ims/shared';

const ROLES: UserRole[] = [
  'Sales Representative',
  'Store Manager',
  'Finance Officer',
  'Delivery Driver',
  'Technical Manager/Owner',
];

describe('hasPermission', () => {
  it('returns true for Sales Representative own permissions', () => {
    expect(hasPermission('Sales Representative', 'order:create')).toBe(true);
    expect(hasPermission('Sales Representative', 'order:view-own')).toBe(true);
    expect(hasPermission('Sales Representative', 'proforma:generate')).toBe(true);
  });

  it('returns false for Sales Representative accessing admin permissions', () => {
    expect(hasPermission('Sales Representative', 'user:manage')).toBe(false);
    expect(hasPermission('Sales Representative', 'payment:verify')).toBe(false);
    expect(hasPermission('Sales Representative', 'report:view')).toBe(false);
  });

  it('returns true for Store Manager inventory permissions', () => {
    expect(hasPermission('Store Manager', 'product:manage')).toBe(true);
    expect(hasPermission('Store Manager', 'batch:manage')).toBe(true);
    expect(hasPermission('Store Manager', 'inventory:adjust')).toBe(true);
  });

  it('returns false for Store Manager finance permissions', () => {
    expect(hasPermission('Store Manager', 'payment:verify')).toBe(false);
    expect(hasPermission('Store Manager', 'receipt:generate')).toBe(false);
  });

  it('returns true for Finance Officer payment permissions', () => {
    expect(hasPermission('Finance Officer', 'payment:verify')).toBe(true);
    expect(hasPermission('Finance Officer', 'payment:reject')).toBe(true);
    expect(hasPermission('Finance Officer', 'payment:view')).toBe(true);
  });

  it('returns false for Finance Officer delivery permissions', () => {
    expect(hasPermission('Finance Officer', 'delivery:assign')).toBe(false);
    expect(hasPermission('Finance Officer', 'delivery:update-status')).toBe(false);
  });

  it('returns true for Delivery Driver delivery permissions', () => {
    expect(hasPermission('Delivery Driver', 'delivery:view-assigned')).toBe(true);
    expect(hasPermission('Delivery Driver', 'delivery:update-status')).toBe(true);
    expect(hasPermission('Delivery Driver', 'delivery:view-history')).toBe(true);
  });

  it('returns false for Delivery Driver unrelated permissions', () => {
    expect(hasPermission('Delivery Driver', 'order:create')).toBe(false);
    expect(hasPermission('Delivery Driver', 'payment:view')).toBe(false);
  });

  it('returns true for Technical Manager/Owner for all permissions', () => {
    const allPerms = [
      'order:create', 'order:view-all', 'product:manage', 'batch:manage',
      'payment:verify', 'delivery:assign', 'report:view', 'user:manage',
      'settings:manage', 'audit:view',
    ];
    allPerms.forEach((p) => {
      expect(hasPermission('Technical Manager/Owner', p)).toBe(true);
    });
  });
});

describe('getAllPermissions', () => {
  ROLES.forEach((role) => {
    it(`returns an array for ${role}`, () => {
      const perms = getAllPermissions(role);
      expect(Array.isArray(perms)).toBe(true);
      expect(perms.length).toBeGreaterThan(0);
    });
  });

  it('returns correct permissions for Delivery Driver', () => {
    const perms = getAllPermissions('Delivery Driver');
    expect(perms).toContain('delivery:view-assigned');
    expect(perms).toContain('delivery:update-status');
    expect(perms).not.toContain('order:create');
  });

  it('Technical Manager/Owner has audit:view', () => {
    const perms = getAllPermissions('Technical Manager/Owner');
    expect(perms).toContain('audit:view');
  });
});

import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { UserRole } from '@pharma-ims/shared';
import { useAuthStore } from '@/stores/auth-store';
import { hasPermission } from '@/lib/utils/permissions';

export function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const role = useAuthStore((s) => s.role);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!role) return <Navigate to="/auth/login" replace />;
  if (!hasPermission(role as UserRole, permission)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

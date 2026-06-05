import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { RequirePermission } from '@/components/layout/require-permission';
import { LoginPage } from '@/features/auth/pages/login-page';
import { ResetPasswordPage } from '@/features/auth/pages/reset-password-page';
import { useAuthStore } from '@/stores/auth-store';
import { getLandingRoute } from '@/lib/utils';

function PR({ permission, children }: { permission: string; children: React.ReactNode }) {
  return <RequirePermission permission={permission}>{children}</RequirePermission>;
}

const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })),
);
const ProductPage = lazy(() =>
  import('@/features/products/pages/product-page').then((m) => ({ default: m.ProductPage })),
);
const BatchPage = lazy(() =>
  import('@/features/batches/pages/batch-page').then((m) => ({ default: m.BatchPage })),
);
const InventoryPage = lazy(() =>
  import('@/features/inventory/pages/inventory-page').then((m) => ({ default: m.InventoryPage })),
);
const CustomerPage = lazy(() =>
  import('@/features/customers/pages/customer-page').then((m) => ({ default: m.CustomerPage })),
);
const OrderListPage = lazy(() =>
  import('@/features/sales/pages/order-list-page').then((m) => ({ default: m.OrderListPage })),
);
const CreateOrderPage = lazy(() =>
  import('@/features/sales/pages/create-order-page').then((m) => ({ default: m.CreateOrderPage })),
);
const PaymentPage = lazy(() =>
  import('@/features/payments/pages/payment-page').then((m) => ({ default: m.PaymentPage })),
);
const InvoicePage = lazy(() =>
  import('@/features/invoices/pages/invoice-page').then((m) => ({ default: m.InvoicePage })),
);
const DeliveryPage = lazy(() =>
  import('@/features/deliveries/pages/delivery-page').then((m) => ({ default: m.DeliveryPage })),
);
const ReportsPage = lazy(() =>
  import('@/features/reports/pages/reports-page').then((m) => ({ default: m.ReportsPage })),
);

const UserManagementPage = lazy(() =>
  import('@/features/users/pages/user-management-page').then((m) => ({ default: m.UserManagementPage })),
);
const SettingsPage = lazy(() =>
  import('@/features/settings/pages/settings-page').then((m) => ({ default: m.SettingsPage })),
);
const AuditLogPage = lazy(() =>
  import('@/features/audit/pages/audit-log-page').then((m) => ({ default: m.AuditLogPage })),
);

function RoleRedirect() {
  const role = useAuthStore((s) => s.role);
  return <Navigate to={getLandingRoute(role)} replace />;
}

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      Loading...
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleRedirect />} />
        <Route path="dashboard" element={<Suspense fallback={<PageFallback />}><DashboardPage /></Suspense>} />
        <Route path="products" element={<Suspense fallback={<PageFallback />}><PR permission="product:view"><ProductPage /></PR></Suspense>} />
        <Route path="batches" element={<Suspense fallback={<PageFallback />}><PR permission="batch:manage"><BatchPage /></PR></Suspense>} />
        <Route path="inventory" element={<Suspense fallback={<PageFallback />}><PR permission="inventory:view"><InventoryPage /></PR></Suspense>} />
        <Route path="customers" element={<Suspense fallback={<PageFallback />}><PR permission="customer:view"><CustomerPage /></PR></Suspense>} />
        <Route path="sales" element={<Suspense fallback={<PageFallback />}><PR permission="order:create"><OrderListPage /></PR></Suspense>} />
        <Route path="sales/create" element={<Suspense fallback={<PageFallback />}><PR permission="order:create"><CreateOrderPage /></PR></Suspense>} />
        <Route path="payments" element={<Suspense fallback={<PageFallback />}><PR permission="payment:view"><PaymentPage /></PR></Suspense>} />
        <Route path="invoices" element={<Suspense fallback={<PageFallback />}><PR permission="invoice:view"><InvoicePage /></PR></Suspense>} />
        <Route path="deliveries" element={<Suspense fallback={<PageFallback />}><PR permission="delivery:view-assigned"><DeliveryPage /></PR></Suspense>} />
        <Route path="reports" element={<Suspense fallback={<PageFallback />}><PR permission="report:view"><ReportsPage /></PR></Suspense>} />

        <Route path="users" element={<Suspense fallback={<PageFallback />}><PR permission="user:manage"><UserManagementPage /></PR></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageFallback />}><PR permission="settings:manage"><SettingsPage /></PR></Suspense>} />
        <Route path="audit" element={<Suspense fallback={<PageFallback />}><PR permission="audit:view"><AuditLogPage /></PR></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

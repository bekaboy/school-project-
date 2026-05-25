import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { LoginPage } from '@/features/auth/pages/login-page';
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page';
import { ProductPage } from '@/features/products/pages/product-page';
import { BatchPage } from '@/features/batches/pages/batch-page';
import { InventoryPage } from '@/features/inventory/pages/inventory-page';
import { CustomerPage } from '@/features/customers/pages/customer-page';
import { OrderListPage } from '@/features/sales/pages/order-list-page';
import { CreateOrderPage } from '@/features/sales/pages/create-order-page';
import { PaymentPage } from '@/features/payments/pages/payment-page';
import { InvoicePage } from '@/features/invoices/pages/invoice-page';
import { DeliveryPage } from '@/features/deliveries/pages/delivery-page';
import { ReportsPage } from '@/features/reports/pages/reports-page';
import { DashboardPage as ReportsDashboardPage } from '@/features/reports/pages/dashboard-page';
import { UserManagementPage } from '@/features/users/pages/user-management-page';
import { SettingsPage } from '@/features/settings/pages/settings-page';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductPage />} />
        <Route path="batches" element={<BatchPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="customers" element={<CustomerPage />} />
        <Route path="sales" element={<OrderListPage />} />
        <Route path="sales/create" element={<CreateOrderPage />} />
        <Route path="payments" element={<PaymentPage />} />
        <Route path="invoices" element={<InvoicePage />} />
        <Route path="deliveries" element={<DeliveryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/dashboard" element={<ReportsDashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

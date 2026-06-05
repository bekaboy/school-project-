import { useMemo } from 'react';
import {
  useProducts,
  useBatches,
  useSalesOrders,
  usePayments,
  useDeliveries,
} from '@/lib/supabase/queries';
import { useAuthStore } from '@/stores/auth-store';
import { KpiCard } from '@/features/dashboard/components/kpi-card';
import { SalesChart } from '@/features/dashboard/components/sales-chart';
import { TopProductsChart } from '@/features/dashboard/components/top-products-chart';
import { OrderStatusChart } from '@/features/dashboard/components/order-status-chart';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  Clock,
  Wallet,
  Truck,
  BarChart3,
} from 'lucide-react';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  const { data: productsRes } = useProducts();
  const products = productsRes?.data ?? [];
  const { data: batches } = useBatches();
  const { data: ordersRes } = useSalesOrders();
  const orders = ordersRes?.data ?? [];
  const { data: paymentsRes } = usePayments();
  const payments = paymentsRes?.data ?? [];
  const { data: deliveries } = useDeliveries();

  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);

  const activeOrdersCount = useMemo(
    () => (orders ?? []).filter((o: any) => !['Delivered', 'Cancelled'].includes(o.status)).length,
    [orders],
  );

  const lowStockCount = useMemo(() => {
    if (!products || !batches) return 0;
    const stockMap: Record<string, number> = {};
    for (const b of batches as any[]) {
      if (b.batch_status === 'Active') {
        const pid = b.product_id as string;
        stockMap[pid] = (stockMap[pid] ?? 0) + (b.quantity_remaining ?? 0);
      }
    }
    return (products as any[]).filter(
      (p: any) => p.active_status !== false && (stockMap[p.id] ?? 0) < (p.reorder_quantity ?? 10),
    ).length;
  }, [products, batches]);

  const expiringCount = useMemo(
    () => (batches ?? []).filter((b: any) => {
      const expiry = new Date(b.expiry_date);
      return expiry > now && expiry <= threeMonthsFromNow;
    }).length,
    [batches, now, threeMonthsFromNow],
  );

  const pendingPaymentCount = useMemo(
    () => (payments ?? []).filter((p: any) => p.status === 'Uploaded').length,
    [payments],
  );

  const inTransitCount = useMemo(
    () => (deliveries ?? []).filter((d: any) => d.status === 'In Transit').length,
    [deliveries],
  );

  const productCount = useMemo(
    () => (products ?? []).filter((p: any) => p.active_status !== false).length,
    [products],
  );

  const orderStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    (orders ?? []).forEach((o: any) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const salesTrendData = useMemo(() => {
    const months: Record<string, number> = {};
    (orders ?? [])
      .filter((o: any) => o.order_date)
      .forEach((o: any) => {
        const d = new Date(o.order_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months[key] = (months[key] ?? 0) + (o.total ?? 0);
      });
    return Object.entries(months)
      .slice(-6)
      .map(([month, total]) => ({
        month: month.slice(5),
        total,
      }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const counts: Record<string, number> = {};
    (orders ?? []).forEach((o: any) => {
      (o.order_items ?? []).forEach((item: any) => {
        const name = item.products?.generic_name ?? 'Unknown';
        counts[name] = (counts[name] ?? 0) + (item.quantity ?? 0);
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));
  }, [orders]);

  const isDriver = role === 'Delivery Driver';
  const isFinance = role === 'Finance Officer';
  const isManager = role === 'Store Manager' || role === 'Technical Manager/Owner';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {isDriver
            ? 'Your active deliveries and tasks.'
            : isFinance
              ? 'Payment and invoice overview.'
              : 'Pharmacy operations at a glance.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Total Products"
          value={productCount}
          icon={Package}
        />
        <KpiCard
          title="Active Orders"
          value={activeOrdersCount}
          icon={ShoppingCart}
        />
        {(isManager || !isDriver) && (
          <KpiCard
            title="Low Stock"
            value={lowStockCount}
            icon={AlertTriangle}
            accent="text-amber-600"
          />
        )}
        {(isManager || !isDriver) && (
          <KpiCard
            title="Expiring Soon"
            value={expiringCount}
            icon={Clock}
            accent="text-orange-600"
          />
        )}
        {(isFinance || isManager) && (
          <KpiCard
            title="Pending Payments"
            value={pendingPaymentCount}
            icon={Wallet}
            accent="text-blue-600"
          />
        )}
        {(!isDriver || inTransitCount > 0) && (
          <KpiCard
            title="In Transit"
            value={isDriver ? inTransitCount : inTransitCount}
            icon={Truck}
            accent="text-indigo-600"
          />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <OrderStatusChart data={orderStatusData} />
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          <SalesChart data={salesTrendData} />
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <TopProductsChart data={topProducts} />
          <div className="rounded-lg border bg-card p-5 space-y-3">
            <h3 className="text-sm font-medium">Quick Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-medium">{(orders ?? []).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Batches</span>
                <span className="font-medium">{(batches ?? []).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-medium">
                  {(orders ?? []).reduce((sum: number, o: any) => sum + (o.total ?? 0), 0).toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Order Value</span>
                <span className="font-medium">
                  {(orders ?? []).length > 0
                    ? ((orders ?? []).reduce((sum: number, o: any) => sum + (o.total ?? 0), 0) / (orders ?? []).length).toFixed(0)
                    : '0'} ETB
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

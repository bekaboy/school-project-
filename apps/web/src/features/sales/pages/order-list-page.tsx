import { useSalesOrders, useUpdateSalesOrder } from '@/lib/supabase/queries';
import { OrderTable } from '@/features/sales/components/order-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

export function OrderListPage() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const { data: orders, isLoading } = useSalesOrders(role === 'Sales Representative' ? user?.id : undefined);
  const updateOrder = useUpdateSalesOrder();
  const navigate = useNavigate();

  async function handleCancel(id: string) {
    if (window.confirm('Cancel this sales order?')) {
      await updateOrder.mutateAsync({ id, status: 'Cancelled' });
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Orders</h1>
          <p className="text-muted-foreground">Manage and track all sales orders through the lifecycle.</p>
        </div>
        <Button onClick={() => navigate('/sales/create')}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      <OrderTable orders={(orders ?? []) as never} onCancel={handleCancel} />
    </div>
  );
}

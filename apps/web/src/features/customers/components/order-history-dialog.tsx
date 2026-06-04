import { useOrdersByCustomer } from '@/lib/supabase/queries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Tables } from '@pharma-ims/shared';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Tables<'customers'>;
}

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-yellow-100 text-yellow-700',
  Proforma: 'bg-blue-100 text-blue-700',
  Verified: 'bg-green-100 text-green-700',
  'Invoice Generated': 'bg-purple-100 text-purple-700',
  Paid: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-600',
};

export function OrderHistoryDialog({ open, onOpenChange, customer }: Props) {
  const { data: orders, isLoading } = useOrdersByCustomer(customer.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Orders — {customer.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">Loading...</div>
        ) : !orders || orders.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No orders found for this customer.
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div className="space-y-1">
                  <p className="font-medium">{order.order_id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.order_date ?? order.created_at ?? Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono">{formatCurrency(order.total)}</span>
                  <Badge className={STATUS_COLORS[order.status] ?? ''}>{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

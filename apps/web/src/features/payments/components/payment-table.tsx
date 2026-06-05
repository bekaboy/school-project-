import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import type { Tables } from '@pharma-ims/shared';

type PaymentWithOrder = Tables<'payments'> & {
  sales_orders: Tables<'sales_orders'> & {
    customers: Pick<Tables<'customers'>, 'name'> | null;
    order_items: Array<{
      products: Pick<Tables<'products'>, 'generic_name' | 'strength'> | null;
      quantity: number;
    }> | null;
  };
};

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Pending: 'secondary',
  Uploaded: 'outline',
  Verified: 'default',
  Rejected: 'destructive',
  Completed: 'default',
};

interface PaymentTableProps {
  payments: PaymentWithOrder[];
  onVerify: (payment: PaymentWithOrder) => void;
  onReject: (payment: PaymentWithOrder) => void;
}

export function PaymentTable({ payments, onVerify, onReject }: PaymentTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const statuses = useMemo(() => {
    const set = new Set(payments.map((p) => p.status));
    return ['', ...Array.from(set).sort()];
  }, [payments]);

  const filtered = useMemo(() => {
    let result = payments;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          (p.sales_orders?.customers?.name ?? '').toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q),
      );
    }
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [payments, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {statuses.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s || 'All'}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">
                    {payment.sales_orders?.order_id ?? '—'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {payment.sales_orders?.customers?.name ?? 'Unknown'}
                  </TableCell>
                  <TableCell className="text-xs max-w-40 truncate">
                    {payment.sales_orders?.order_items?.length
                      ? payment.sales_orders.order_items.map((item) =>
                          `${item.products?.generic_name ?? 'Unknown'} x${item.quantity}`
                        ).join(', ')
                      : <span className="text-muted-foreground">—</span>
                    }
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(payment.created_at ?? '')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor[payment.status] ?? 'secondary'}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">
                      {(payment as any).receipt_number ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {payment.proof_url ? (
                      <a
                        href={payment.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary underline underline-offset-2 hover:text-primary/80"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {payment.status === 'Uploaded' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-emerald-600"
                            onClick={() => onVerify(payment)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => onReject(payment)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {payment.status === 'Rejected' && payment.rejection_reason && (
                        <span className="text-xs text-muted-foreground max-w-24 truncate" title={payment.rejection_reason}>
                          {payment.rejection_reason}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {payments.length} payments
      </p>
    </div>
  );
}

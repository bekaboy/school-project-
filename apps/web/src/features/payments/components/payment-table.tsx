import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { PAGE_SIZE } from '@/lib/utils/constants';
import type { Tables } from '@pharma-ims/shared';

type PaymentWithOrder = Tables<'payments'> & {
  sales_orders: Tables<'sales_orders'> & {
    customers: Pick<Tables<'customers'>, 'name'> | null;
    order_items: Array<{
      products: Pick<Tables<'products'>, 'generic_name' | 'brand_name' | 'strength'> | null;
      quantity: number;
      unit_price: number;
      total_price: number;
    }> | null;
  };
};

const statusStyles: Record<string, string> = {
  Pending: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100/80',
  Uploaded: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100/80',
  Verified: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80',
  Rejected: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100/80',
  Completed: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100/80',
};

interface PaymentTableProps {
  payments: PaymentWithOrder[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onVerify: (payment: PaymentWithOrder) => void;
  onReject: (payment: PaymentWithOrder) => void;
}

export function PaymentTable({ payments, totalCount, page, onPageChange, search, onSearchChange, statusFilter, onStatusFilterChange, onVerify, onReject }: PaymentTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const statuses = useMemo(() => ['', 'Pending', 'Uploaded', 'Verified', 'Rejected', 'Completed'], []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {statuses.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusFilterChange(s)}
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
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">
                    {payment.sales_orders?.order_id ?? '—'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {payment.sales_orders?.customers?.name ?? 'Unknown'}
                  </TableCell>
                  <TableCell className="text-xs max-w-56">
                    {payment.sales_orders?.order_items?.length
                      ? <div className="space-y-0.5">
                          {payment.sales_orders.order_items.map((item, i) => (
                            <div key={i} className="flex justify-between gap-2">
                              <span className="truncate">
                                {item.products?.generic_name ?? 'Unknown'}{item.products?.brand_name ? ` (${item.products.brand_name})` : ''}
                              </span>
                              <span className="font-mono shrink-0">
                                x{item.quantity} @ {formatCurrency(item.unit_price)}
                              </span>
                            </div>
                          ))}
                        </div>
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
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[payment.status] ?? 'bg-secondary text-secondary-foreground'}`}>
                      {payment.status}
                    </span>
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

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemLabel="payments"
        showing={payments.length}
        total={totalCount}
      />
    </div>
  );
}

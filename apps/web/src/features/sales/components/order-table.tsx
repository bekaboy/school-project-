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
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useSort } from '@/lib/utils/use-sort';
import { Eye, Search, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Tables } from '@pharma-ims/shared';

type OrderWithRelations = Tables<'sales_orders'> & {
  customers: Pick<Tables<'customers'>, 'name'> | null;
  users: Pick<Tables<'users'>, 'full_name'> | null;
  order_items: Array<{
    products: Pick<Tables<'products'>, 'generic_name' | 'strength'> | null;
    quantity: number;
  }> | null;
};

const PAGE_SIZE = 20;

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Draft: 'secondary',
  'Proforma Generated': 'default',
  'Pending Payment': 'outline',
  Verified: 'default',
  'Invoice Generated': 'default',
  'In Transit': 'default',
  Delivered: 'default',
  Cancelled: 'destructive',
  Failed: 'destructive',
  Rescheduled: 'outline',
};

function SortableHead<T>({ label, sortKey, currentKey, direction, onClick, className }: {
  label: string; sortKey: keyof T; currentKey: keyof T | undefined; direction: 'asc' | 'desc';
  onClick: (key: keyof T) => void; className?: string;
}) {
  const isActive = currentKey === sortKey;
  return (
    <TableHead className={`cursor-pointer select-none hover:text-foreground transition-colors ${className ?? ''}`} onClick={() => onClick(sortKey)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && <span className="text-primary text-xs">{direction === 'asc' ? '\u25B2' : '\u25BC'}</span>}
      </span>
    </TableHead>
  );
}

interface OrderTableProps {
  orders: OrderWithRelations[];
  onCancel?: (id: string) => void;
  onView?: (order: OrderWithRelations) => void;
}

export function OrderTable({ orders, onCancel, onView }: OrderTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.order_id.toLowerCase().includes(q) ||
        (o.customers?.name ?? '').toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q),
    );
  }, [orders, search]);

  const { sorted, sortKey, sortDir, getSortProps } = useSort(filtered, 'order_date' as keyof OrderWithRelations);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Order #" sortKey="order_id" currentKey={sortKey} direction={sortDir} onClick={getSortProps('order_id').onClick} />
              <TableHead>Customer</TableHead>
              <TableHead>Sales Rep</TableHead>
              <TableHead>Items</TableHead>
              <SortableHead label="Date" sortKey="order_date" currentKey={sortKey} direction={sortDir} onClick={getSortProps('order_date').onClick} />
              <SortableHead label="Total" sortKey="total" currentKey={sortKey} direction={sortDir} onClick={getSortProps('total').onClick} className="text-right" />
              <SortableHead label="Status" sortKey="status" currentKey={sortKey} direction={sortDir} onClick={getSortProps('status').onClick} />
              <TableHead className="w-16">View</TableHead>
              {onCancel && <TableHead className="w-16" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={onCancel ? 9 : 8} className="h-32 text-center text-muted-foreground">
                  No sales orders found.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.order_id}</TableCell>
                  <TableCell className="font-medium">{order.customers?.name ?? 'Unknown'}</TableCell>
                  <TableCell className="text-muted-foreground">{order.users?.full_name ?? '—'}</TableCell>
                  <TableCell className="text-xs max-w-48 truncate">
                    {order.order_items?.length
                      ? order.order_items.map((item) =>
                          `${item.products?.generic_name ?? 'Unknown'} x${item.quantity}`
                        ).join(', ')
                      : <span className="text-muted-foreground">—</span>
                    }
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(order.order_date ?? order.created_at ?? '')}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor[order.status] ?? 'secondary'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onView?.(order)} title="View order details">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  {onCancel && (order.status === 'Draft' || order.status === 'Proforma Generated') && (
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => onCancel(order.id)} title="Cancel order">
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                  {onCancel && order.status !== 'Draft' && order.status !== 'Proforma Generated' && (
                    <TableCell />
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {pageItems.length} of {sorted.length} orders
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {safePage + 1} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

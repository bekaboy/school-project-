import { useMemo } from 'react';
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
import { PaginationControls } from '@/components/ui/pagination-controls';
import { Eye, Search, XCircle } from 'lucide-react';
import { PAGE_SIZE } from '@/lib/utils/constants';
import type { Tables } from '@pharma-ims/shared';

type OrderWithRelations = Tables<'sales_orders'> & {
  customers: Pick<Tables<'customers'>, 'name'> | null;
  users: Pick<Tables<'users'>, 'full_name'> | null;
  order_items: Array<{
    products: Pick<Tables<'products'>, 'generic_name' | 'strength'> | null;
    batches: Pick<Tables<'batches'>, 'expiry_date'> | null;
    quantity: number;
  }> | null;
};

const statusStyles: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100/80',
  'Proforma Generated': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100/80',
  'Pending Payment': 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100/80',
  Verified: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80',
  'Invoice Generated': 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100/80',
  'In Transit': 'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-100/80',
  Delivered: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100/80',
  Cancelled: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100/80',
  Failed: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100/80',
  Rescheduled: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100/80',
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
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onCancel?: (id: string) => void;
  onView?: (order: OrderWithRelations) => void;
}

export function OrderTable({ orders, totalCount, page, onPageChange, search, onSearchChange, onCancel, onView }: OrderTableProps) {
  const { sorted, sortKey, sortDir, getSortProps } = useSort(orders, 'order_date' as keyof OrderWithRelations);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
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
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={onCancel ? 9 : 8} className="h-32 text-center text-muted-foreground">
                  No sales orders found.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.order_id}</TableCell>
                  <TableCell className="font-medium">{order.customers?.name ?? 'Unknown'}</TableCell>
                  <TableCell className="text-muted-foreground">{order.users?.full_name ?? '—'}</TableCell>
                  <TableCell className="text-xs max-w-56 truncate">
                    {order.order_items?.length
                      ? order.order_items.map((item) => {
                          const exp = item.batches?.expiry_date;
                          return exp
                            ? `${item.products?.generic_name ?? 'Unknown'} x${item.quantity} (Exp: ${formatDate(exp)})`
                            : `${item.products?.generic_name ?? 'Unknown'} x${item.quantity}`;
                        }).join(', ')
                      : <span className="text-muted-foreground">—</span>
                    }
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(order.order_date ?? order.created_at ?? '')}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[order.status] ?? ''}>
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

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemLabel="orders"
        showing={sorted.length}
        total={totalCount}
      />
    </div>
  );
}

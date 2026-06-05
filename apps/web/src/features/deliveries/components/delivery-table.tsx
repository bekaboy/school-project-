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
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatDateTime } from '@/lib/utils/formatters';
import {
  Search,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
  X,
  UserPlus,
} from 'lucide-react';
import type { Tables } from '@pharma-ims/shared';

type DeliveryWithRelations = Tables<'deliveries'> & {
  delivery_notes: string | null;
  sales_orders: Tables<'sales_orders'> & {
    customers: Pick<Tables<'customers'>, 'name' | 'address' | 'phone'> | null;
  };
  users: Pick<Tables<'users'>, 'full_name'> | null;
};

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Assigned: 'secondary',
  'In Transit': 'default',
  Delivered: 'default',
  Failed: 'destructive',
  Rescheduled: 'outline',
  Cancelled: 'destructive',
};

interface DeliveryTableProps {
  deliveries: DeliveryWithRelations[];
  isDriver: boolean;
  onAssign: (delivery: DeliveryWithRelations) => void;
  onStatusUpdate: (id: string, status: string, orderId: string, reason?: string) => void;
  updating: boolean;
}

export function DeliveryTable({ deliveries, isDriver, onAssign, onStatusUpdate, updating }: DeliveryTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const statuses = useMemo(() => {
    const set = new Set(deliveries.map((d) => d.status));
    return ['', ...Array.from(set).sort()];
  }, [deliveries]);

  const filtered = useMemo(() => {
    let result = deliveries;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.sales_orders?.order_id?.toLowerCase().includes(q) ||
          (d.sales_orders?.customers?.name ?? '').toLowerCase().includes(q) ||
          (d.users?.full_name ?? '').toLowerCase().includes(q) ||
          d.status.toLowerCase().includes(q),
      );
    }
    if (statusFilter) {
      result = result.filter((d) => d.status === statusFilter);
    }
    return result;
  }, [deliveries, search, statusFilter]);

  function canUpdate(status: string, action: string): boolean {
    const transitions: Record<string, string[]> = {
      Assigned: ['In Transit', 'Cancelled'],
      'In Transit': ['Delivered', 'Failed'],
      Failed: ['Assigned', 'Cancelled'],
    };
    return (transitions[status] ?? []).includes(action);
  }

  const actionLabel: Record<string, string> = {
    'In Transit': 'Dispatch',
    Delivered: 'Delivered',
    Failed: 'Fail',
    Assigned: 'Reschedule',
    Cancelled: 'Cancel',
  };

  if (isDriver) {
    return (
      <div className="space-y-3">
        <Input
          placeholder="Search your deliveries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Truck className="mx-auto h-8 w-8 mb-2 opacity-50" />
              No deliveries found.
            </CardContent>
          </Card>
        ) : (
          filtered.map((d) => (
            <Card key={d.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-base">{d.sales_orders?.customers?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      Order: {d.sales_orders?.order_id ?? '—'}
                    </p>
                  </div>
                  <Badge variant={statusColor[d.status] ?? 'secondary'} className="text-xs">
                    {d.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-1 text-sm">
                  {d.sales_orders?.delivery_address && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Deliver to</span>
                      <p>{d.sales_orders.delivery_address}</p>
                    </div>
                  )}
                  {d.sales_orders?.customers?.phone && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Customer phone</span>
                      <p className="font-mono">{d.sales_orders.customers.phone}</p>
                    </div>
                  )}
                </div>

                {(d.sales_orders as any)?.order_items && (d.sales_orders as any).order_items.length > 0 && (
                  <div className="border-t pt-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Items</p>
                    <ul className="text-sm space-y-0.5">
                      {(d.sales_orders as any).order_items.map((item: any, i: number) => (
                        <li key={i} className="flex justify-between">
                          <span className="truncate flex-1">{item.products?.generic_name ?? 'Unknown'} {item.products?.strength ? `(${item.products.strength})` : ''}</span>
                          <span className="font-mono ml-2 shrink-0">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {d.delivery_instructions && (
                  <p className="text-xs italic text-muted-foreground border-l-2 border-muted pl-2">
                    {d.delivery_instructions}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {canUpdate(d.status, 'In Transit') && (
                    <Button
                      size="sm"
                      className="flex-1 min-w-0"
                      onClick={() => onStatusUpdate(d.id, 'In Transit', d.order_id)}
                      disabled={updating}
                    >
                      <Truck className="mr-1 h-4 w-4" />
                      Start Delivery
                    </Button>
                  )}
                  {canUpdate(d.status, 'Delivered') && (
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 min-w-0 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => onStatusUpdate(d.id, 'Delivered', d.order_id)}
                      disabled={updating}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Delivered
                    </Button>
                  )}
                  {canUpdate(d.status, 'Failed') && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 min-w-0"
                      onClick={() => {
                        const reason = window.prompt('Reason for failure:');
                        if (reason) onStatusUpdate(d.id, 'Failed', d.order_id, reason);
                      }}
                      disabled={updating}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Failed
                    </Button>
                  )}
                </div>

                {d.status === 'Delivered' && d.recipient_name && (
                  <div className="border-t pt-2 text-sm">
                    <p><span className="text-xs text-muted-foreground uppercase tracking-wide">Received by</span> {d.recipient_name}</p>
                    {d.delivery_notes && <p className="text-xs text-muted-foreground mt-1 italic">"{d.delivery_notes}"</p>}
                  </div>
                )}

                {d.failure_reason && (
                  <p className="text-xs text-destructive">Reason: {d.failure_reason}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
        <p className="text-sm text-muted-foreground">
          {filtered.length} delivery{filtered.length !== 1 ? 'ies' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search deliveries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
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
              <TableHead>Driver</TableHead>
              <TableHead>Delivery Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-32 text-center text-muted-foreground">
                  No deliveries found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">
                    {d.sales_orders?.order_id ?? '—'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {d.sales_orders?.customers?.name ?? 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {d.users?.full_name ?? (
                      <span className="text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm max-w-40 truncate">
                    {d.sales_orders?.delivery_address || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {d.sales_orders?.customers?.phone || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs max-w-48 truncate">
                    {(d.sales_orders as any)?.order_items?.length > 0
                      ? (d.sales_orders as any).order_items.map((item: any) =>
                          `${item.products?.generic_name ?? 'Unknown'} x${item.quantity}`
                        ).join(', ')
                      : <span className="text-muted-foreground">—</span>
                    }
                  </TableCell>
                  <TableCell className="text-sm">
                    {d.recipient_name || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-xs max-w-32 truncate">
                    {d.delivery_notes || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(d.assigned_at ?? d.created_at ?? '')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColor[d.status] ?? 'secondary'}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {d.status === 'Assigned' && !d.driver_id && (
                        <Button variant="ghost" size="icon" onClick={() => onAssign(d)}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                      {canUpdate(d.status, 'Cancelled') && (
                        <Button variant="ghost" size="icon" onClick={() => onStatusUpdate(d.id, 'Cancelled', d.order_id)}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                      {d.failure_reason && (
                        <span className="text-xs text-muted-foreground max-w-20 truncate" title={d.failure_reason}>
                          {d.failure_reason}
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
        Showing {filtered.length} of {deliveries.length} deliveries
      </p>
    </div>
  );
}

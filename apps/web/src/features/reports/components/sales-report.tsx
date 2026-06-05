import { useState, useMemo } from 'react';
import { useSalesOrders } from '@/lib/supabase/queries';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { exportToCsv } from '@/lib/excel/export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download } from 'lucide-react';

export function SalesReport() {
  const { data: ordersRes, isLoading } = useSalesOrders();
  const orders = ordersRes?.data ?? [];
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(() => {
    let result = (orders ?? []) as any[];
    if (startDate) {
      result = result.filter((o: any) => new Date(o.order_date ?? o.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((o: any) => new Date(o.order_date ?? o.created_at) <= end);
    }
    return result;
  }, [orders, startDate, endDate]);

  const summary = useMemo(() => {
    const totalRevenue = filtered.reduce((sum: number, o: any) => sum + (o.total ?? 0), 0);
    const totalOrders = filtered.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, avgOrderValue };
  }, [filtered]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-48 text-muted-foreground">Loading...</div>;
  }

  function handleExport() {
    const rows = filtered.map((o: any) => ({
      'Order ID': o.order_id,
      'Customer': o.customers?.name ?? 'Unknown',
      'Date': formatDate(o.order_date ?? o.created_at ?? ''),
      'Status': o.status,
      'Subtotal': o.subtotal,
      'Tax': o.tax,
      'Total': o.total,
    }));
    exportToCsv(rows, `sales-report-${startDate || 'all'}-${endDate || 'all'}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div>
          <Label>From</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>To</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1" />
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">{summary.totalOrders}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Avg Order Value</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.avgOrderValue)}</p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No orders in this date range.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.order_id}</TableCell>
                  <TableCell className="font-medium">{o.customers?.name ?? 'Unknown'}</TableCell>
                  <TableCell className="text-sm">{formatDate(o.order_date ?? o.created_at ?? '')}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(o.subtotal)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(o.tax)}</TableCell>
                  <TableCell className="text-right font-mono font-medium">{formatCurrency(o.total)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

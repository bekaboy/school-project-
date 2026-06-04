import { useMemo, useState } from 'react';
import { useBatches } from '@/lib/supabase/queries';
import { formatDate } from '@/lib/utils/formatters';
import { exportToCsv } from '@/lib/excel/export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Search } from 'lucide-react';

export function BatchTraceReport() {
  const { data: batches, isLoading } = useBatches();
  const [search, setSearch] = useState('');

  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);

  const data = useMemo(() => {
    if (!batches) return [];
    let result = (batches as any[]).map((b) => ({
      batchNumber: b.batch_number,
      productName: b.products?.generic_name ?? 'Unknown',
      brandName: b.products?.brand_name ?? '',
      supplier: b.supplier,
      quantityReceived: b.quantity_received,
      quantityRemaining: b.quantity_remaining,
      manufacturingDate: b.manufacturing_date,
      expiryDate: b.expiry_date,
      status: b.batch_status ?? 'Active',
      daysToExpiry: Math.round((new Date(b.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      stockUsed: b.quantity_received - b.quantity_remaining,
    }));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.batchNumber.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          r.supplier.toLowerCase().includes(q),
      );
    }
    return result;
  }, [batches, search]);

  const stats = useMemo(
    () => ({
      total: data.length,
      active: data.filter((r) => r.status === 'Active').length,
      expired: data.filter((r) => r.daysToExpiry <= 0).length,
      expiring: data.filter((r) => r.daysToExpiry > 0 && r.daysToExpiry <= 90).length,
    }),
    [data],
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-48 text-muted-foreground">Loading...</div>;
  }

  function handleExport() {
    const rows = data.map((r) => ({
      'Batch Number': r.batchNumber,
      'Product': r.productName,
      'Brand': r.brandName,
      'Supplier': r.supplier,
      'Quantity Received': r.quantityReceived,
      'Quantity Remaining': r.quantityRemaining,
      'Stock Used': r.stockUsed,
      'Manufacturing Date': formatDate(r.manufacturingDate),
      'Expiry Date': formatDate(r.expiryDate),
      'Days to Expiry': r.daysToExpiry,
      'Status': r.status,
    }));
    exportToCsv(rows, 'batch-traceability-report');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search batches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Batches</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold">{stats.active}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Expiring (≤90d)</p>
          <p className="text-2xl font-bold text-orange-600">{stats.expiring}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Expired</p>
          <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch #</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead>Mfg</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No batch data found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((r, i) => (
                <TableRow
                  key={i}
                  className={
                    r.daysToExpiry <= 0
                      ? 'bg-destructive/5'
                      : r.daysToExpiry <= 90
                        ? 'bg-amber-50 dark:bg-amber-950/20'
                        : ''
                  }
                >
                  <TableCell className="font-mono text-xs">{r.batchNumber}</TableCell>
                  <TableCell>
                    <span className="font-medium">{r.productName}</span>
                    {r.brandName && <span className="text-xs text-muted-foreground ml-1">({r.brandName})</span>}
                  </TableCell>
                  <TableCell className="text-sm">{r.supplier}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{r.quantityReceived}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{r.quantityRemaining}</TableCell>
                  <TableCell className="text-sm">{formatDate(r.manufacturingDate)}</TableCell>
                  <TableCell className="text-sm">{formatDate(r.expiryDate)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.status === 'Active'
                          ? 'default'
                          : r.status === 'Expired'
                            ? 'destructive'
                            : 'outline'
                      }
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

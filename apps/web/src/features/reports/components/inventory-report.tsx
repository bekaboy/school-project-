import { useMemo, useState } from 'react';
import { useProducts, useBatches } from '@/lib/supabase/queries';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { exportToCsv } from '@/lib/excel/export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Search } from 'lucide-react';

export function InventoryReport() {
  const { data: products, isLoading: pLoading } = useProducts();
  const { data: batches, isLoading: bLoading } = useBatches();
  const [search, setSearch] = useState('');

  const data = useMemo(() => {
    if (!products || !batches) return [];
    return (products as any[])
      .filter((p) => p.active_status !== false)
      .map((p) => {
        const productBatches = (batches as any[]).filter((b) => b.product_id === p.id);
        const totalStock = productBatches.reduce((sum: number, b: any) => sum + (b.quantity_remaining ?? 0), 0);
        const totalValue = totalStock * (p.cost_price ?? 0);
        const activeBatches = productBatches.filter((b: any) => b.batch_status === 'Active').length;
        return {
          id: p.id,
          productId: p.product_id,
          genericName: p.generic_name,
          brandName: p.brand_name,
          strength: p.strength,
          category: p.category,
          totalStock,
          reorderQty: p.reorder_quantity ?? 0,
          batchCount: activeBatches,
          stockValue: totalValue,
          sellingPrice: p.selling_price,
        };
      })
      .filter((r) => !search.trim() || r.genericName.toLowerCase().includes(search.toLowerCase()) || r.brandName.toLowerCase().includes(search.toLowerCase()));
  }, [products, batches, search]);

  const totals = useMemo(
    () => ({
      products: data.length,
      stock: data.reduce((s, r) => s + r.totalStock, 0),
      value: data.reduce((s, r) => s + r.stockValue, 0),
    }),
    [data],
  );

  if (pLoading || bLoading) {
    return <div className="flex items-center justify-center h-48 text-muted-foreground">Loading...</div>;
  }

  function handleExport() {
    const rows = data.map((r) => ({
      'Product ID': r.productId,
      'Generic Name': r.genericName,
      'Brand Name': r.brandName,
      'Strength': r.strength,
      'Category': r.category,
      'Total Stock': r.totalStock,
      'Reorder Level': r.reorderQty,
      'Active Batches': r.batchCount,
      'Stock Value (Cost)': r.stockValue.toFixed(2),
      'Selling Price': r.sellingPrice.toFixed(2),
    }));
    exportToCsv(rows, 'inventory-report');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Products</p>
          <p className="text-2xl font-bold">{totals.products}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Units</p>
          <p className="text-2xl font-bold">{totals.stock}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Stock Value (Cost)</p>
          <p className="text-2xl font-bold">{formatCurrency(totals.value)}</p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Reorder</TableHead>
              <TableHead className="text-right">Batches</TableHead>
              <TableHead className="text-right">Stock Value</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No inventory data found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.genericName}</div>
                    <div className="text-xs text-muted-foreground">{r.brandName} - {r.strength}</div>
                  </TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell className="text-right font-mono">
                    <span className={r.totalStock <= r.reorderQty ? 'text-amber-600 font-medium' : ''}>
                      {r.totalStock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{r.reorderQty}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{r.batchCount}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(r.stockValue)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(r.sellingPrice)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

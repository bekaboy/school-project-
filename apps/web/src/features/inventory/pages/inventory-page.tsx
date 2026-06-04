import { useMemo, useState } from 'react';
import { useProducts, useBatches } from '@/lib/supabase/queries';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Search, Package, AlertTriangle, Clock, TrendingDown, Settings2, History } from 'lucide-react';
import { StockAdjustDialog } from '@/features/inventory/components/stock-adjust-dialog';
import { StockMovementDialog } from '@/features/inventory/components/stock-movement-dialog';
import { Button } from '@/components/ui/button';
import type { Tables } from '@pharma-ims/shared';

type BatchWithProduct = Tables<'batches'> & {
  products: Pick<Tables<'products'>, 'generic_name' | 'brand_name'> | null;
};

interface ProductStock {
  product: Tables<'products'>;
  totalStock: number;
  batchCount: number;
  lowStock: boolean;
  expiringBatches: BatchWithProduct[];
  expiredBatches: BatchWithProduct[];
}

export function InventoryPage() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: batches, isLoading: batchesLoading } = useBatches();
  const [search, setSearch] = useState('');
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<{ name: string; batches: BatchWithProduct[] } | null>(null);
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementProduct, setMovementProduct] = useState<{ id: string; name: string } | null>(null);

  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  const stockData = useMemo(() => {
    if (!products || !batches) return [];

    const batchList = batches as BatchWithProduct[];

    return products
      .map((product) => {
        const productBatches = batchList.filter((b) => b.product_id === product.id);
        const activeBatches = productBatches.filter((b) => b.batch_status === 'Active');
        const totalStock = activeBatches.reduce((sum, b) => sum + b.quantity_remaining, 0);

        return {
          product,
          totalStock,
          batchCount: productBatches.length,
          lowStock: totalStock < (product.reorder_quantity ?? 10),
          expiringBatches: productBatches.filter((b) => {
            const expiry = new Date(b.expiry_date);
            return expiry > now && expiry <= threeMonthsFromNow;
          }),
          expiredBatches: productBatches.filter((b) => new Date(b.expiry_date) < now),
        } satisfies ProductStock;
      })
      .filter((p) => p.batchCount > 0 || search === '');
  }, [products, batches, search, now, threeMonthsFromNow]);

  const lowStockCount = stockData.filter((s) => s.lowStock).length;
  const expiringCount = stockData.reduce((sum, s) => sum + s.expiringBatches.length, 0);
  const expiredCount = stockData.reduce((sum, s) => sum + s.expiredBatches.length, 0);
  const totalProducts = stockData.length;

  const filtered = useMemo(() => {
    if (!search.trim()) return stockData;
    const q = search.toLowerCase();
    return stockData.filter(
      (s) =>
        s.product.generic_name.toLowerCase().includes(q) ||
        s.product.brand_name.toLowerCase().includes(q) ||
        s.product.category.toLowerCase().includes(q) ||
        s.product.product_id.toLowerCase().includes(q),
    );
  }, [stockData, search]);

  if (productsLoading || batchesLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Real-time stock levels, expiry tracking, and low-stock alerts.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-600' : ''}`}>
              {lowStockCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${expiringCount > 0 ? 'text-orange-600' : ''}`}>
              {expiringCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${expiredCount > 0 ? 'text-destructive' : ''}`}>
              {expiredCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Batches</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Stock Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No inventory data found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.product.id}>
                  <TableCell>
                    <div className="font-medium">{s.product.generic_name}</div>
                    <div className="text-xs text-muted-foreground">{s.product.brand_name} - {s.product.strength}</div>
                  </TableCell>
                  <TableCell>{s.product.category}</TableCell>
                  <TableCell className="font-mono text-sm">
                    <span
                      className={
                        s.totalStock === 0
                          ? 'text-destructive font-medium'
                          : s.lowStock
                            ? 'text-amber-600 font-medium'
                            : ''
                      }
                    >
                      {s.totalStock}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      / {s.product.reorder_quantity} min
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{s.batchCount}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatCurrency(s.product.selling_price)}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatCurrency(s.totalStock * s.product.selling_price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.lowStock && (
                        <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                      )}
                      {s.expiringBatches.length > 0 && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">
                          {s.expiringBatches.length} expiring
                        </Badge>
                      )}
                      {s.expiredBatches.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {s.expiredBatches.length} expired
                        </Badge>
                      )}
                      {!s.lowStock && s.expiringBatches.length === 0 && s.expiredBatches.length === 0 && (
                        <Badge variant="default" className="text-xs">In Stock</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setMovementProduct({
                            id: s.product.id,
                            name: `${s.product.generic_name} (${s.product.brand_name})`,
                          });
                          setMovementOpen(true);
                        }}
                        title="Stock history"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAdjustProduct({
                            name: `${s.product.generic_name} (${s.product.brand_name})`,
                            batches: (batches as BatchWithProduct[]).filter((b) => b.product_id === s.product.id),
                          });
                          setAdjustOpen(true);
                        }}
                        title="Adjust stock"
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {stockData.length} products with stock
      </p>

      <StockAdjustDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        batches={adjustProduct?.batches ?? []}
        productName={adjustProduct?.name ?? ''}
      />

      {movementProduct && (
        <StockMovementDialog
          open={movementOpen}
          onOpenChange={(open) => { if (!open) setMovementProduct(null); }}
          productId={movementProduct.id}
          productName={movementProduct.name}
        />
      )}
    </div>
  );
}

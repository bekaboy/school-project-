import { useState, useMemo } from 'react';
import { useProducts, useBatches, useDeleteProduct } from '@/lib/supabase/queries';
import { ProductTable } from '@/features/products/components/product-table';
import { ProductForm } from '@/features/products/components/product-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PAGE_SIZE } from '@/lib/utils/constants';
import type { Tables } from '@pharma-ims/shared';

export function ProductPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { data: result, isLoading } = useProducts(page, PAGE_SIZE, search);
  const products = result?.data ?? [];
  const totalCount = result?.count ?? 0;
  const { data: batches } = useBatches();
  const deleteProduct = useDeleteProduct();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Tables<'products'> | null>(null);

  const expiryMap = useMemo(() => {
    if (!batches) return {} as Record<string, string>;
    const map: Record<string, string> = {};
    for (const b of batches) {
      if (b.batch_status !== 'Active' || b.quantity_remaining <= 0) continue;
      const current = map[b.product_id as string];
      if (!current || b.expiry_date < current) {
        map[b.product_id as string] = b.expiry_date;
      }
    }
    return map;
  }, [batches]);

  const batchCountMap = useMemo(() => {
    if (!batches) return {} as Record<string, number>;
    const map: Record<string, number> = {};
    for (const b of batches) {
      if (b.batch_status !== 'Active' || b.quantity_remaining <= 0) continue;
      map[b.product_id as string] = (map[b.product_id as string] ?? 0) + b.quantity_remaining;
    }
    return map;
  }, [batches]);

  function handleEdit(product: Tables<'products'>) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      deleteProduct.mutate(id);
    }
  }

  function handleAdd() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage pharmaceutical product catalog.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <ProductTable
        products={products}
        totalCount={totalCount}
        page={page}
        onPageChange={setPage}
        search={search}
        onSearchChange={(s) => { setSearch(s); setPage(0); }}
        expiryMap={expiryMap}
        batchStockMap={batchCountMap}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
      />
    </div>
  );
}

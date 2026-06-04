import { useState } from 'react';
import { useProducts, useDeleteProduct } from '@/lib/supabase/queries';
import { ProductTable } from '@/features/products/components/product-table';
import { ProductForm } from '@/features/products/components/product-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Tables } from '@pharma-ims/shared';

export function ProductPage() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Tables<'products'> | null>(null);

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
        products={products ?? []}
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

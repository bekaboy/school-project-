import { useState } from 'react';
import { useBatches, useProducts, useDeleteBatch } from '@/lib/supabase/queries';
import { BatchTable } from '@/features/batches/components/batch-table';
import { BatchForm } from '@/features/batches/components/batch-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Tables } from '@pharma-ims/shared';

type BatchWithProduct = Tables<'batches'> & {
  products: Pick<Tables<'products'>, 'generic_name' | 'brand_name'> | null;
};

export function BatchPage() {
  const { data: batches, isLoading } = useBatches();
  const { data: products } = useProducts();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchWithProduct | null>(null);

  function handleEdit(batch: BatchWithProduct) {
    setEditingBatch(batch);
    setFormOpen(true);
  }

  const deleteBatch = useDeleteBatch();

  function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to deactivate this batch?')) {
      deleteBatch.mutate(id);
    }
  }

  function handleAdd() {
    setEditingBatch(null);
    setFormOpen(true);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground">Manage pharmaceutical stock batches, track expiry and inventory.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Batch
        </Button>
      </div>

      <BatchTable
        batches={(batches ?? []) as BatchWithProduct[]}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <BatchForm
        open={formOpen}
        onOpenChange={setFormOpen}
        batch={editingBatch}
        products={products}
      />
    </div>
  );
}

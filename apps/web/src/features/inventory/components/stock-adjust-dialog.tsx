import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateBatch, useCreateAuditLog } from '@/lib/supabase/queries';
import { useAuthStore } from '@/stores/auth-store';
import type { Tables } from '@pharma-ims/shared';

type BatchWithProduct = Tables<'batches'> & {
  products: Pick<Tables<'products'>, 'generic_name' | 'brand_name'> | null;
};

interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batches: BatchWithProduct[];
  productName: string;
}

const REASONS = ['Damaged', 'Expired', 'Returned', 'Correction', 'Other'] as const;

export function StockAdjustDialog({ open, onOpenChange, batches, productName }: StockAdjustDialogProps) {
  const updateBatch = useUpdateBatch();
  const auditLog = useCreateAuditLog();
  const currentUser = useAuthStore((s) => s.user);
  const [batchId, setBatchId] = useState('');
  const [newQty, setNewQty] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!batchId) { setError('Select a batch'); return; }
    if (newQty === '' || Number(newQty) < 0) { setError('Enter a valid quantity (0 or more)'); return; }
    if (!reason) { setError('Select a reason'); return; }

    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    const oldQty = batch.quantity_remaining;
    const qty = Number(newQty);

    await updateBatch.mutateAsync({ id: batchId, quantity_remaining: qty } as never);

    auditLog.mutate({
      action: 'STOCK_ADJUST',
      entity_type: 'batch',
      entity_id: batchId,
      user_id: currentUser?.id ?? '',
      details: {
        product: productName,
        batch: batch.batch_number,
        old_qty: oldQty,
        new_qty: qty,
        reason,
        note,
      },
      ip_address: '',
    } as never);

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust Stock — {productName}</DialogTitle>
          <DialogDescription>Update quantity for damaged, expired, returned, or corrected stock.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Batch *</Label>
            <Select value={batchId} onValueChange={setBatchId}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch..." />
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.batch_number} — Remaining: {b.quantity_remaining}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>New Quantity *</Label>
            <input
              type="number"
              min="0"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-3 text-base"
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-3 text-base"
              placeholder="Additional details..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={updateBatch.isPending}>Apply Adjustment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

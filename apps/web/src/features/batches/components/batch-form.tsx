import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mapToDb } from '@/lib/utils/mapping';
import { useCreateBatch, useUpdateBatch, useCreateAuditLog, useProducts, useBatches } from '@/lib/supabase/queries';
import { useAuthStore } from '@/stores/auth-store';
import type { Tables } from '@pharma-ims/shared';

type BatchWithProduct = Tables<'batches'> & {
  products: Pick<Tables<'products'>, 'generic_name' | 'brand_name'> | null;
};

interface BatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch?: BatchWithProduct | null;
  products?: Tables<'products'>[];
}

interface FormState {
  productId: string;
  batchNumber: string;
  supplier: string;
  quantityReceived: string;
  manufacturingDate: string;
  expiryDate: string;
  dateReceived: string;
  batchStatus: string;
  quarantineReason: string;
}

const todayStr = new Date().toISOString().split('T')[0]!;

const initialForm: FormState = {
  productId: '',
  batchNumber: '',
  supplier: '',
  quantityReceived: '',
  manufacturingDate: '',
  expiryDate: '',
  dateReceived: todayStr,
  batchStatus: 'Active',
  quarantineReason: '',
};

function batchToForm(b: Tables<'batches'>): FormState {
  const mfg = b.manufacturing_date.split('T')[0] ?? '';
  const exp = b.expiry_date.split('T')[0] ?? '';
  const recvd = b.date_received ? b.date_received.split('T')[0] ?? '' : todayStr;
  return {
    productId: b.product_id,
    batchNumber: b.batch_number,
    supplier: b.supplier,
    quantityReceived: String(b.quantity_received),
    manufacturingDate: mfg,
    expiryDate: exp,
    dateReceived: recvd,
    batchStatus: b.batch_status ?? 'Active',
    quarantineReason: '',
  };
}

export function BatchForm({ open, onOpenChange, batch, products: externalProducts }: BatchFormProps) {
  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch();
  const auditLog = useCreateAuditLog();
  const currentUser = useAuthStore((s) => s.user);
  const { data: fetchedProducts } = useProducts();
  const { data: existingBatches } = useBatches();
  const isEditing = !!batch;
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const products = externalProducts ?? fetchedProducts ?? [];

  useEffect(() => {
    if (open) {
      setForm(batch ? batchToForm(batch) : initialForm);
      setErrors({});
    }
  }, [open, batch]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.productId) errs.productId = 'Product is required';
    if (!form.batchNumber.trim()) errs.batchNumber = 'Batch number is required';
    if (!isEditing && existingBatches?.some((b) => b.product_id === form.productId && b.batch_number === form.batchNumber.trim())) {
      errs.batchNumber = 'Batch number already exists for this product';
    }
    if (!form.supplier.trim()) errs.supplier = 'Supplier is required';
    if (!form.quantityReceived || Number(form.quantityReceived) <= 0) {
      errs.quantityReceived = 'Quantity must be positive';
    }
    if (!form.manufacturingDate) errs.manufacturingDate = 'Manufacturing date is required';
    if (!form.expiryDate) errs.expiryDate = 'Expiry date is required';
    if (form.manufacturingDate && form.expiryDate && new Date(form.expiryDate) <= new Date(form.manufacturingDate)) {
      errs.expiryDate = 'Expiry must be after manufacturing date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const values = {
      ...form,
      quantityReceived: Number(form.quantityReceived),
      quantityRemaining: isEditing ? undefined : Number(form.quantityReceived),
    };

    const dbData = mapToDb(values) as Record<string, unknown>;
    delete (dbData as any).quarantine_reason;

    if (isEditing && batch) {
      await updateBatch.mutateAsync({ id: batch.id, ...dbData });
    } else {
      await createBatch.mutateAsync(dbData as never);
    }

    if (form.batchStatus === 'Quarantined' && form.quarantineReason.trim()) {
      auditLog.mutate({
        action: 'QUARANTINE',
        entity_type: 'batch',
        entity_id: batch?.id ?? 'new',
        user_id: currentUser?.id ?? '',
        details: { batch: form.batchNumber, reason: form.quarantineReason.trim() },
        ip_address: '',
      } as never);
    }

    onOpenChange(false);
  }

  const pending = createBatch.isPending || updateBatch.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Batch' : 'Add Batch'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the batch information below.' : 'Enter the details for a new stock batch.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Product *" error={errors.productId}>
            <Select
              value={form.productId}
              onValueChange={(v) => set('productId', v)}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.generic_name} ({p.brand_name}) - {p.strength}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Batch Number *" error={errors.batchNumber}>
              <Input
                placeholder="e.g. BATCH-001"
                value={form.batchNumber}
                onChange={(e) => set('batchNumber', e.target.value)}
                disabled={isEditing}
              />
            </Field>
            <Field label="Supplier *" error={errors.supplier}>
              <Input
                placeholder="Supplier name"
                value={form.supplier}
                onChange={(e) => set('supplier', e.target.value)}
              />
            </Field>
            <Field label="Quantity Received *" error={errors.quantityReceived}>
              <Input
                type="number"
                min="1"
                placeholder="0"
                value={form.quantityReceived}
                onChange={(e) => set('quantityReceived', e.target.value)}
                disabled={isEditing}
              />
            </Field>
            <Field label="Batch Status">
              <Select
                value={form.batchStatus}
                onValueChange={(v) => set('batchStatus', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Quarantined">Quarantined</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Manufacturing Date *" error={errors.manufacturingDate}>
              <Input
                type="date"
                value={form.manufacturingDate}
                onChange={(e) => set('manufacturingDate', e.target.value)}
              />
            </Field>
            <Field label="Expiry Date *" error={errors.expiryDate}>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) => set('expiryDate', e.target.value)}
              />
            </Field>
            <Field label="Date Received">
              <Input
                type="date"
                value={form.dateReceived}
                onChange={(e) => set('dateReceived', e.target.value)}
              />
            </Field>
          </div>

          {form.batchStatus === 'Quarantined' && (
            <Field label="Quarantine Reason">
              <Textarea
                placeholder="Why is this batch being quarantined?"
                value={form.quarantineReason}
                onChange={(e) => set('quarantineReason', e.target.value)}
              />
            </Field>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {isEditing ? 'Update Batch' : 'Add Batch'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

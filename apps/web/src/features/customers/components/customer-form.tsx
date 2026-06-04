import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { mapToDb } from '@/lib/utils/mapping';
import { useCreateCustomer, useUpdateCustomer } from '@/lib/supabase/queries';
import type { Tables } from '@pharma-ims/shared';

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Tables<'customers'> | null;
}

interface FormState {
  name: string;
  contactPerson: string;
  phone: string;
  alternatePhone: string;
  email: string;
  address: string;
  taxId: string;
  licenseNumber: string;
  paymentTerms: string;
  creditLimit: string;
}

const initialForm: FormState = {
  name: '', contactPerson: '', phone: '', alternatePhone: '', email: '',
  address: '', taxId: '', licenseNumber: '', paymentTerms: '', creditLimit: '',
};

function customerToForm(c: Tables<'customers'>): FormState {
  return {
    name: c.name,
    contactPerson: c.contact_person ?? '',
    phone: c.phone,
    alternatePhone: c.alternate_phone ?? '',
    email: c.email ?? '',
    address: c.address ?? '',
    taxId: c.tax_id ?? '',
    licenseNumber: c.license_number ?? '',
    paymentTerms: c.payment_terms ?? '',
    creditLimit: c.credit_limit ? String(c.credit_limit) : '',
  };
}

export function CustomerForm({ open, onOpenChange, customer }: CustomerFormProps) {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const isEditing = !!customer;
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(customer ? customerToForm(customer) : initialForm);
      setErrors({});
    }
  }, [open, customer]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = 'Customer name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (form.creditLimit && (isNaN(Number(form.creditLimit)) || Number(form.creditLimit) <= 0)) {
      errs.creditLimit = 'Must be a positive number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const values: Record<string, unknown> = {
      ...form,
      creditLimit: form.creditLimit ? Number(form.creditLimit) : undefined,
    };

    const dbData = mapToDb(values);

    if (isEditing && customer) {
      await updateCustomer.mutateAsync({ id: customer.id, ...dbData });
    } else {
      await createCustomer.mutateAsync(dbData as never);
    }

    onOpenChange(false);
  }

  const pending = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the customer information below.' : 'Enter the details for a new customer.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Customer Name *" error={errors.name} className="col-span-2">
            <Input placeholder="Full name or business name" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact Person" error={errors.contactPerson}>
              <Input placeholder="Optional" value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} />
            </Field>
            <Field label="Phone *" error={errors.phone}>
              <Input placeholder="+251 9XX XXX XXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </Field>
            <Field label="Alternate Phone" error={errors.alternatePhone}>
              <Input placeholder="Optional" value={form.alternatePhone} onChange={(e) => set('alternatePhone', e.target.value)} />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input type="email" placeholder="customer@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Tax ID" error={errors.taxId}>
              <Input placeholder="Optional" value={form.taxId} onChange={(e) => set('taxId', e.target.value)} />
            </Field>
            <Field label="License Number" error={errors.licenseNumber}>
              <Input placeholder="Optional" value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} />
            </Field>
            <Field label="Payment Terms" error={errors.paymentTerms}>
              <Input placeholder="e.g. Net 30" value={form.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value)} />
            </Field>
            <Field label="Credit Limit (ETB)" error={errors.creditLimit}>
              <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.creditLimit} onChange={(e) => set('creditLimit', e.target.value)} />
            </Field>
          </div>

          <Field label="Address">
            <Textarea placeholder="Street, city, region..." value={form.address} onChange={(e) => set('address', e.target.value)} />
          </Field>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{isEditing ? 'Update Customer' : 'Add Customer'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

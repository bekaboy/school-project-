import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers, useProducts, useBatches, useCreateSalesOrder, useCreateOrderItems } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/formatters';
import { Trash2, Plus, ChevronLeft, ChevronRight, Check, Package } from 'lucide-react';
import type { Tables } from '@pharma-ims/shared';
import { useAuthStore } from '@/stores/auth-store';
import { useMachine } from '@xstate/react';
import { salesOrderMachine } from '@/features/sales/machines/sales-order.state-machine';
import { generateProformaPdf, downloadBlob } from '@/lib/pdf/proforma';

interface LineItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  taxRate: number;
}

interface FormData {
  customerId: string;
  deliveryAddress: string;
  specialInstructions: string;
  items: LineItem[];
}

export function CreateOrderForm() {
  const navigate = useNavigate();
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();
  const { data: batches } = useBatches();
  const createOrder = useCreateSalesOrder();
  const createItems = useCreateOrderItems();
  const user = useAuthStore((s) => s.user);

  const [state, send] = useMachine(salesOrderMachine);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    customerId: '',
    deliveryAddress: '',
    specialInstructions: '',
    items: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCustomer = useMemo(
    () => customers?.find((c) => c.id === form.customerId),
    [customers, form.customerId],
  );

  const subtotal = useMemo(
    () => form.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [form.items],
  );

  const taxTotal = useMemo(
    () => form.items.reduce((sum, i) => sum + i.unitPrice * i.quantity * (i.taxRate / 100), 0),
    [form.items],
  );

  const grandTotal = subtotal + taxTotal;

  const availableStock = useMemo(() => {
    if (!batches) return {};
    const stock: Record<string, number> = {};
    for (const b of batches) {
      if (b.batch_status === 'Active' && b.quantity_remaining > 0) {
        const pid = b.product_id as string;
        stock[pid] = (stock[pid] ?? 0) + b.quantity_remaining;
      }
    }
    return stock;
  }, [batches]);

  function getStockError(item: LineItem, index: number): string | null {
    if (!item.productId) return null;
    const available = availableStock[item.productId] ?? 0;
    const totalRequested = form.items.reduce(
      (sum, it, idx) => (it.productId === item.productId ? sum + (idx === index ? item.quantity : it.quantity) : sum),
      0,
    );
    if (totalRequested > available) {
      return `Only ${available} in stock`;
    }
    return null;
  }

  function updateCustomer(id: string) {
    const customer = customers?.find((c) => c.id === id);
    setForm((prev) => ({
      ...prev,
      customerId: id,
      deliveryAddress: customer?.address ?? '',
    }));
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { productId: '', productName: '', unitPrice: 0, quantity: 1, taxRate: 0 },
      ],
    }));
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setForm((prev) => {
      const items = [...prev.items];
      const current = items[index]!;
      if (field === 'productId') {
        const product = products?.find((p) => p.id === value);
        items[index] = {
          ...current,
          productId: value as string,
          productName: product ? `${product.generic_name} (${product.brand_name})` : '',
          unitPrice: product?.selling_price ?? 0,
          taxRate: product?.tax_rate ?? 0,
          quantity: 1,
        };
      } else if (field === 'quantity') {
        items[index] = { ...current, quantity: Number(value) };
      }
      return { ...prev, items };
    });
  }

  function removeItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.customerId) errs.customerId = 'Please select a customer';
    } else if (step === 1) {
      if (form.items.length === 0) errs.items = 'Add at least one item';
      form.items.forEach((item, i) => {
        if (!item.productId) errs[`item_${i}_product`] = 'Select a product';
        if (item.quantity < 1) errs[`item_${i}_qty`] = 'Qty must be at least 1';
        const stockErr = getStockError(item, i);
        if (item.productId && stockErr) {
          errs[`item_${i}_stock`] = stockErr;
        }
      });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (validateStep()) setStep((s) => Math.min(s + 1, 2));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (!user) return;

    if (selectedCustomer?.credit_limit && grandTotal > selectedCustomer.credit_limit) {
      setErrors({ credit: `Order total (${formatCurrency(grandTotal)}) exceeds credit limit (${formatCurrency(selectedCustomer.credit_limit)}).` });
      return;
    }

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 90000) + 10000);
    const orderId = `SO-${y}${m}${d}-${seq}`;

    const newOrder = await createOrder.mutateAsync({
      order_id: orderId,
      customer_id: form.customerId,
      sales_rep_id: user.id,
      status: state.value,
      subtotal,
      tax: taxTotal,
      total: grandTotal,
      delivery_address: form.deliveryAddress || null,
      special_instructions: form.specialInstructions || null,
      order_date: new Date().toISOString(),
    } as never);

    const items = form.items.map((item) => ({
      order_id: newOrder.id,
      product_id: item.productId,
      batch_id: '',
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }));

    await createItems.mutateAsync(items as never);

    send({ type: 'GENERATE_PROFORMA' });

    const pdfData = {
      orderId: newOrder.order_id,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      customerName: selectedCustomer?.name ?? '',
      customerAddress: form.deliveryAddress || selectedCustomer?.address || '',
      customerPhone: selectedCustomer?.phone ?? '',
      salesRep: user.email ?? '',
      items: form.items.map((i) => ({
        description: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.unitPrice * i.quantity,
      })),
      subtotal,
      tax: taxTotal,
      total: grandTotal,
    };

    const blob = await generateProformaPdf(pdfData);
    downloadBlob(blob, `proforma-${newOrder.order_id}.pdf`);

    navigate('/sales');
  }

  const steps = ['Customer', 'Items', 'Review'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i < step
                  ? 'bg-primary text-primary-foreground'
                  : i === step
                    ? 'bg-primary/20 text-primary border border-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              {s}
            </span>
            {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4 max-w-lg">
          <Field label="Customer *" error={errors.customerId}>
            <Select value={form.customerId} onValueChange={updateCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} — {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {selectedCustomer && (
            <div className="rounded-md bg-muted p-3 space-y-1 text-sm">
              <p><span className="font-medium">Contact:</span> {selectedCustomer.contact_person ?? '—'}</p>
              <p><span className="font-medium">Phone:</span> {selectedCustomer.phone}</p>
              <p><span className="font-medium">Address:</span> {selectedCustomer.address ?? '—'}</p>
              {selectedCustomer.credit_limit && (
                <p><span className="font-medium">Credit Limit:</span> {formatCurrency(selectedCustomer.credit_limit)}</p>
              )}
            </div>
          )}

          <Field label="Delivery Address">
            <Textarea
              placeholder="Enter delivery address"
              value={form.deliveryAddress}
              onChange={(e) => setForm((p) => ({ ...p, deliveryAddress: e.target.value }))}
            />
          </Field>

          <Field label="Special Instructions">
            <Textarea
              placeholder="Optional instructions"
              value={form.specialInstructions}
              onChange={(e) => setForm((p) => ({ ...p, specialInstructions: e.target.value }))}
            />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-64">Product</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="w-24 text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Select
                        value={item.productId}
                        onValueChange={(v) => updateItem(i, 'productId', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((p) => {
                            const stock = availableStock[p.id] ?? 0;
                            return (
                              <SelectItem key={p.id} value={p.id}>
                                <span className="flex items-center gap-2">
                                  <span>{p.generic_name} ({p.brand_name}) - {p.strength}</span>
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    <Package className="h-3 w-3" />
                                    {stock}
                                  </span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {errors[`item_${i}_product`] && (
                        <p className="text-sm text-destructive mt-1">{errors[`item_${i}_product`]}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                        className="text-right"
                      />
                      {errors[`item_${i}_qty`] && (
                        <p className="text-sm text-destructive">{errors[`item_${i}_qty`]}</p>
                      )}
                      {item.productId && (() => {
                        const err = getStockError(item, i);
                        return err ? <p className="text-sm text-destructive">{err}</p> : null;
                      })()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}

          <Button variant="outline" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>

          <div className="flex justify-end gap-2 text-sm">
            <div className="space-y-1 text-right">
              <p>Items: {form.items.length}</p>
              <p className="font-medium">Subtotal: {formatCurrency(subtotal)}</p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 max-w-2xl">
          <div className="rounded-md bg-muted p-4 space-y-1 text-sm">
            <p><span className="font-medium">Customer:</span> {selectedCustomer?.name}</p>
            <p><span className="font-medium">Delivery:</span> {form.deliveryAddress || 'Not specified'}</p>
            {form.specialInstructions && (
              <p><span className="font-medium">Instructions:</span> {form.specialInstructions}</p>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Avail.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.items.map((item, i) => {
                  const stock = item.productId ? (availableStock[item.productId] ?? 0) : 0;
                  const insufficient = item.productId && item.quantity > stock;
                  return (
                    <TableRow key={i}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                      <TableCell className={`text-right font-mono ${insufficient ? 'text-destructive font-bold' : ''}`}>
                        {stock}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {form.items.some((item) => {
            const stock = item.productId ? (availableStock[item.productId] ?? 0) : 0;
            return item.quantity > stock;
          }) && (
            <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
              Some items exceed available stock. Go back and adjust quantities.
            </div>
          )}

          {errors.credit && (
            <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
              {errors.credit}
            </div>
          )}

          <div className="flex justify-end">
            <div className="space-y-1 text-right text-sm">
              <p>Subtotal: <span className="font-mono">{formatCurrency(subtotal)}</span></p>
              <p>Tax: <span className="font-mono">{formatCurrency(taxTotal)}</span></p>
              <p className="text-lg font-bold">Total: <span className="font-mono">{formatCurrency(grandTotal)}</span></p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={step === 0 ? () => navigate('/sales') : prevStep}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>

        {step < 2 ? (
          <Button onClick={nextStep}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={
              createOrder.isPending ||
              createItems.isPending ||
              form.items.some((item) => {
                const stock = item.productId ? (availableStock[item.productId] ?? 0) : 0;
                return item.quantity > stock;
              })
            }
          >
            {createOrder.isPending ? 'Creating...' : 'Generate Proforma'}
          </Button>
        )}
      </div>
    </div>
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

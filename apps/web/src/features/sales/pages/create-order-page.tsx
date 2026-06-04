import { CreateOrderForm } from '@/features/sales/components/create-order-form';

export function CreateOrderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Sales Order</h1>
        <p className="text-muted-foreground">
          Select a customer, add items, and generate a proforma invoice.
        </p>
      </div>
      <CreateOrderForm />
    </div>
  );
}

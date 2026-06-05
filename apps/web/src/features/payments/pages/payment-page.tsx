import { useState } from 'react';
import { usePayments, useUpdatePayment, useUpdateSalesOrder } from '@/lib/supabase/queries';
import { PaymentTable } from '@/features/payments/components/payment-table';
import { PaymentVerifyDialog } from '@/features/payments/components/payment-verify-dialog';
import { generateInvoiceForOrder } from '@/lib/utils/invoice-generator';
import type { Tables } from '@pharma-ims/shared';
import { useAuthStore } from '@/stores/auth-store';

type PaymentWithOrder = Tables<'payments'> & {
  sales_orders: Tables<'sales_orders'> & {
    customers: Pick<Tables<'customers'>, 'name'> | null;
    order_items: Array<{
      products: Pick<Tables<'products'>, 'generic_name' | 'strength'> | null;
      quantity: number;
    }> | null;
  };
};

export function PaymentPage() {
  const { data: payments, isLoading } = usePayments();
  const user = useAuthStore((s) => s.user);
  const updatePayment = useUpdatePayment();
  const updateOrder = useUpdateSalesOrder();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithOrder | null>(null);

  function handleVerify(payment: PaymentWithOrder) {
    setSelectedPayment(payment);
    setDialogOpen(true);
  }

  function handleReject(payment: PaymentWithOrder) {
    setSelectedPayment(payment);
    setDialogOpen(true);
  }

  async function handleConfirm(action: 'verify' | 'reject', reason?: string) {
    if (!selectedPayment || !user) return;

    if (action === 'verify') {
      const year = new Date().getFullYear();
      const seq = String(Math.floor(Math.random() * 90000) + 10000);
      const receiptNumber = `RCPT-${year}-${seq}`;

      await updatePayment.mutateAsync({
        id: selectedPayment.id,
        status: 'Verified',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        receipt_number: receiptNumber,
      });

      await updateOrder.mutateAsync({
        id: selectedPayment.order_id,
        status: 'Verified',
      });

      await generateInvoiceForOrder(selectedPayment.order_id);
    } else {
      await updatePayment.mutateAsync({
        id: selectedPayment.id,
        status: 'Rejected',
        rejection_reason: reason,
      });
      await updateOrder.mutateAsync({
        id: selectedPayment.order_id,
        status: 'Proforma Generated',
      });
    }

    setDialogOpen(false);
    setSelectedPayment(null);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  const pending = updatePayment.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Review payment proofs and verify or reject incoming payments.
        </p>
      </div>

      <PaymentTable
        payments={(payments ?? []) as PaymentWithOrder[]}
        onVerify={handleVerify}
        onReject={handleReject}
      />

      <PaymentVerifyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        payment={selectedPayment}
        onConfirm={handleConfirm}
        isPending={pending}
      />
    </div>
  );
}

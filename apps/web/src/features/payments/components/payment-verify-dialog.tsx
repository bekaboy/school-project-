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
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import type { Tables } from '@pharma-ims/shared';

type PaymentWithOrder = Tables<'payments'> & {
  sales_orders: Tables<'sales_orders'> & {
    customers: Pick<Tables<'customers'>, 'name'> | null;
    order_items: Array<{
      products: Pick<Tables<'products'>, 'generic_name' | 'strength'> | null;
      quantity: number;
    }> | null;
  };
};

interface PaymentVerifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentWithOrder | null;
  onConfirm: (action: 'verify' | 'reject', reason?: string) => void;
  isPending: boolean;
}

export function PaymentVerifyDialog({ open, onOpenChange, payment, onConfirm, isPending }: PaymentVerifyDialogProps) {
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState<'verify' | 'reject' | null>(null);

  if (!payment) return null;

  function handleConfirm() {
    if (mode) onConfirm(mode, mode === 'reject' ? reason : undefined);
    setReason('');
    setMode(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment Review</DialogTitle>
          <DialogDescription>
            Review payment proof and verify or reject.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-muted p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order</span>
              <span className="font-mono">{payment.sales_orders?.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{payment.sales_orders?.customers?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-mono font-medium">{formatCurrency(payment.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submitted</span>
              <span>{formatDateTime(payment.created_at ?? '')}</span>
            </div>
            {payment.sales_orders?.order_items && payment.sales_orders.order_items.length > 0 && (
              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Items</p>
                {payment.sales_orders.order_items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>{item.products?.generic_name ?? 'Unknown'}</span>
                    <span className="font-mono">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {payment.proof_url && (
            <div>
              <Label>Payment Proof</Label>
              <div className="mt-1">
                {payment.proof_url.match(/\.(png|jpg|jpeg|gif|webp)/i) ? (
                  <img
                    src={payment.proof_url}
                    alt="Payment proof"
                    className="rounded-md border max-h-64 w-full object-contain bg-muted"
                  />
                ) : (
                  <a
                    href={payment.proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open proof document
                  </a>
                )}
              </div>
            </div>
          )}

          {mode === 'reject' && (
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                placeholder="Explain why the payment is being rejected..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            {!mode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setMode('reject')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => setMode('verify')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => { setMode(null); setReason(''); }}>
                  Back
                </Button>
                <Button
                  variant={mode === 'reject' ? 'destructive' : 'default'}
                  onClick={handleConfirm}
                  disabled={isPending || (mode === 'reject' && !reason.trim())}
                >
                  {isPending ? 'Processing...' : mode === 'verify' ? 'Confirm Verify' : 'Confirm Reject'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

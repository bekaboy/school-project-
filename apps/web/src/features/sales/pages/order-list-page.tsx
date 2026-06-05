import { useState, useRef } from 'react';
import { useSalesOrders, useUpdateSalesOrder, usePaymentByOrder, useCreatePayment } from '@/lib/supabase/queries';
import { OrderTable } from '@/features/sales/components/order-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { uploadPaymentProof } from '@/lib/supabase/storage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Draft: 'secondary',
  'Proforma Generated': 'default',
  'Pending Payment': 'outline',
  Verified: 'default',
  'Invoice Generated': 'default',
  'In Transit': 'default',
  Delivered: 'default',
  Cancelled: 'destructive',
  Failed: 'destructive',
  Rescheduled: 'outline',
};

type ViewOrder = NonNullable<ReturnType<typeof useSalesOrders>['data']>[number];

export function OrderListPage() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const { data: orders, isLoading } = useSalesOrders(role === 'Sales Representative' ? user?.id : undefined);
  const updateOrder = useUpdateSalesOrder();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [viewTarget, setViewTarget] = useState<ViewOrder | null>(null);

  const { data: existingPayment } = usePaymentByOrder(viewTarget?.id ?? '');
  const createPayment = useCreatePayment();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    try {
      await updateOrder.mutateAsync({ id: cancelTarget, status: 'Cancelled' });
      toast({ title: 'Order cancelled', description: 'The sales order has been cancelled successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to cancel the order.', variant: 'destructive' });
    } finally {
      setCancelTarget(null);
    }
  }

  async function handleUploadProof() {
    if (!viewTarget || !proofFile || !user) return;
    setUploading(true);
    try {
      const proofUrl = await uploadPaymentProof(proofFile, viewTarget.id);
      await createPayment.mutateAsync({
        order_id: viewTarget.id,
        amount: viewTarget.total,
        status: 'Uploaded',
        proof_url: proofUrl,
      } as never);
      await updateOrder.mutateAsync({ id: viewTarget.id, status: 'Pending Payment' });
      toast({ title: 'Proof uploaded', description: 'Payment proof submitted. Finance will review it.' });
      setProofFile(null);
    } catch (err) {
      toast({ title: 'Upload failed', description: err instanceof Error ? err.message : 'Failed to upload payment proof.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Orders</h1>
          <p className="text-muted-foreground">Manage and track all sales orders through the lifecycle.</p>
        </div>
        <Button onClick={() => navigate('/sales/create')}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      <OrderTable orders={(orders ?? []) as never} onCancel={setCancelTarget} onView={setViewTarget} />

      <Dialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) setCancelTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Sales Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this sales order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>Keep Order</Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={updateOrder.isPending}>
              {updateOrder.isPending ? 'Cancelling...' : 'Yes, Cancel Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewTarget} onOpenChange={(open) => { if (!open) { setViewTarget(null); setProofFile(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {viewTarget?.order_id}</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={statusColor[viewTarget.status] ?? 'secondary'}>{viewTarget.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t pt-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Customer</p>
                  <p className="font-medium">{viewTarget.customers?.name ?? 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Sales Rep</p>
                  <p>{viewTarget.users?.full_name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                  <p>{formatDate(viewTarget.order_date ?? viewTarget.created_at ?? '')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                  <p className="font-mono font-medium">{formatCurrency(viewTarget.total)}</p>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Delivery Address</p>
                <p>{viewTarget.delivery_address || 'Not specified'}</p>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Items Ordered</p>
                {(viewTarget as any).order_items?.length > 0 ? (
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {(viewTarget as any).order_items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.products?.generic_name ?? 'Unknown'} {item.products?.strength ? `(${item.products.strength})` : ''}</span>
                        <span className="font-mono shrink-0 ml-2">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>

              {viewTarget.special_instructions && (
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Instructions</p>
                  <p>{viewTarget.special_instructions}</p>
                </div>
              )}

              {/* Payment Section */}
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Payment</p>
                {(() => {
                  const showUpload = viewTarget.status === 'Proforma Generated';
                  const isRejected = existingPayment?.status === 'Rejected';
                  const isPending = existingPayment && ['Pending', 'Uploaded'].includes(existingPayment.status);
                  const isVerified = existingPayment?.status === 'Verified';

                  if (isVerified) {
                    return (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Payment Verified</span>
                      </div>
                    );
                  }

                  if (isRejected) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-destructive bg-destructive/5 rounded-md p-3">
                          <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Payment Rejected</p>
                            <p className="text-sm mt-1">{existingPayment.rejection_reason}</p>
                          </div>
                        </div>
                        {existingPayment.proof_url && (
                          <div>
                            {existingPayment.proof_url.match(/\.(png|jpg|jpeg|gif|webp)/i) ? (
                              <img src={existingPayment.proof_url} alt="Payment proof" className="rounded-md border max-h-32 w-full object-contain bg-muted" />
                            ) : (
                              <a href={existingPayment.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-2 text-sm">
                                <ExternalLink className="h-3 w-3" /> View proof
                              </a>
                            )}
                          </div>
                        )}
                        {showUpload && (
                          <>
                            <p className="text-sm text-muted-foreground">Upload a new payment proof for re-review.</p>
                            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="hidden" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
                            {proofFile ? (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">{proofFile.name}</p>
                                <Button onClick={handleUploadProof} disabled={uploading} className="w-full">{uploading ? 'Uploading...' : 'Submit Payment Proof'}</Button>
                                <Button variant="ghost" size="sm" onClick={() => setProofFile(null)} className="w-full">Cancel</Button>
                              </div>
                            ) : (
                              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full"><Upload className="mr-2 h-4 w-4" />Select Payment Screenshot</Button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }

                  if (isPending) {
                    return (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Payment proof uploaded. Awaiting finance review.</p>
                        {existingPayment.proof_url && (
                          <div>
                            {existingPayment.proof_url.match(/\.(png|jpg|jpeg|gif|webp)/i) ? (
                              <img src={existingPayment.proof_url} alt="Payment proof" className="rounded-md border max-h-48 w-full object-contain bg-muted" />
                            ) : (
                              <a href={existingPayment.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-2 text-sm">
                                <ExternalLink className="h-3 w-3" /> View proof
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (showUpload) {
                    return (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Send the proforma PDF to the customer. Upload their payment screenshot here.
                        </p>
                        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="hidden" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
                        {proofFile ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">{proofFile.name}</p>
                            <Button onClick={handleUploadProof} disabled={uploading} className="w-full">{uploading ? 'Uploading...' : 'Submit Payment Proof'}</Button>
                            <Button variant="ghost" size="sm" onClick={() => setProofFile(null)} className="w-full">Cancel</Button>
                          </div>
                        ) : (
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full"><Upload className="mr-2 h-4 w-4" />Select Payment Screenshot</Button>
                        )}
                      </div>
                    );
                  }

                  if (['Draft', 'Cancelled', 'Failed'].includes(viewTarget.status)) {
                    return <p className="text-sm text-muted-foreground">—</p>;
                  }

                  return <p className="text-sm text-muted-foreground">—</p>;
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

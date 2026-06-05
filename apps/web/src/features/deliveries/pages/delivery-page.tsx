import { useState, useMemo } from 'react';
import {
  useDeliveries,
  useDeliveriesByDriver,
  useCreateDelivery,
  useUpdateDelivery,
  useSalesOrders,
  useUsers,
} from '@/lib/supabase/queries';
import { DeliveryTable } from '@/features/deliveries/components/delivery-table';
import { DeliveryAssignDialog } from '@/features/deliveries/components/delivery-assign-dialog';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Plus, Truck, Printer, Package } from 'lucide-react';
import { DeliveryConfirmDialog } from '@/features/deliveries/components/delivery-confirm-dialog';
import { generateDeliveryManifestPdf, downloadBlob } from '@/lib/pdf/delivery-manifest';
import { supabase } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Tables } from '@pharma-ims/shared';

type DeliveryWithRelations = Tables<'deliveries'> & {
  delivery_notes: string | null;
  sales_orders: Tables<'sales_orders'> & {
    customers: Pick<Tables<'customers'>, 'name' | 'address' | 'phone'> | null;
  };
  users: Pick<Tables<'users'>, 'full_name'> | null;
};

export function DeliveryPage() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const isDriver = role === 'Delivery Driver';

  const { data: allDeliveries, isLoading: allLoading } = useDeliveries();
  const { data: driverDeliveries, isLoading: driverLoading } = useDeliveriesByDriver(user?.id ?? '');
  const { data: users } = useUsers();
  const { data: ordersRes } = useSalesOrders();
  const orders = ordersRes?.data ?? [];

  const createDelivery = useCreateDelivery();
  const updateDelivery = useUpdateDelivery();

  const [assignOpen, setAssignOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newDeliveryOpen, setNewDeliveryOpen] = useState(false);
  const [confirmDeliveryId, setConfirmDeliveryId] = useState<string | null>(null);
  const [creatingIds, setCreatingIds] = useState<Set<string>>(new Set());
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryWithRelations | null>(null);

  const deliveries = (isDriver ? driverDeliveries : allDeliveries) as DeliveryWithRelations[] | undefined;
  const isLoading = isDriver ? driverLoading : allLoading;
  const drivers = (users ?? []).filter((u) => u.role === 'Delivery Driver' && u.is_active !== false);
  const verifiedOrders = (orders ?? [] as any[]).filter(
    (o: any) => o.status === 'Invoice Generated' && !(deliveries ?? []).some((d: any) => d.order_id === o.id),
  );

  function handleAssign(delivery: DeliveryWithRelations) {
    setSelectedDelivery(delivery);
    setAssignOpen(true);
  }

  async function handleAssignConfirm(driverId: string, instructions: string) {
    if (!selectedDelivery) return;
    await updateDelivery.mutateAsync({
      id: selectedDelivery.id,
      driver_id: driverId,
      delivery_instructions: instructions || null,
      status: 'Assigned',
      assigned_at: new Date().toISOString(),
    } as never);
    setAssignOpen(false);
    setSelectedDelivery(null);
  }

  async function handleStatusUpdate(id: string, status: string, orderId: string, reason?: string) {
    const updates: Record<string, unknown> = { status };

    if (status === 'Delivered') {
      setConfirmDeliveryId(id);
      setConfirmOpen(true);
      return;
    }
    if (status === 'Failed') {
      updates.failure_reason = reason;
    }
    if (status === 'In Transit') {
      updates.assigned_at = new Date().toISOString();
    }

    const delivery = await updateDelivery.mutateAsync({ id, ...updates } as never);

    const orderStatusMap: Record<string, string> = {
      'In Transit': 'In Transit',
      Failed: 'Failed',
      Cancelled: 'Cancelled',
    };
    const orderStatus = orderStatusMap[status];
    if (orderStatus && orderId) {
      await supabase.from('sales_orders').update({ status: orderStatus }).eq('id', orderId);
    }
  }

  async function handleCreateDelivery(orderId: string) {
    await createDelivery.mutateAsync({
      order_id: orderId,
      status: 'Assigned',
      created_at: new Date().toISOString(),
    } as never);
  }

  async function handlePrintManifest() {
    if (!deliveries || deliveries.length === 0) return;
    const manifestDeliveries = deliveries.map((d: any) => ({
      orderId: d.sales_orders?.order_id ?? '',
      customerName: d.sales_orders?.customers?.name ?? '—',
      address: d.sales_orders?.delivery_address || d.sales_orders?.customers?.address || '',
      phone: d.sales_orders?.customers?.phone ?? '',
      driverName: d.users?.full_name ?? 'Unassigned',
      status: d.status,
      items: (d.sales_orders?.order_items ?? []).map((item: any) =>
        `${item.products?.generic_name ?? 'Unknown'} x${item.quantity}`
      ),
    }));
    const blob = await generateDeliveryManifestPdf({
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      driverName: isDriver ? (deliveries[0] as any)?.users?.full_name ?? 'Driver' : 'All Drivers',
      deliveries: manifestDeliveries,
    });
    downloadBlob(blob, `delivery-manifest-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isDriver ? 'My Deliveries' : 'Deliveries'}
          </h1>
          <p className="text-muted-foreground">
            {isDriver
              ? 'View and update your assigned deliveries.'
              : 'Assign drivers and track delivery status.'}
          </p>
        </div>
        <div className="flex gap-2">
          {deliveries && deliveries.length > 0 && (
            <Button variant="outline" onClick={handlePrintManifest}>
              <Printer className="mr-2 h-4 w-4" />
              Print Manifest
            </Button>
          )}
          {!isDriver && verifiedOrders.length > 0 && (
            <Button onClick={() => setNewDeliveryOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Delivery
            </Button>
          )}
        </div>
      </div>

      {!isDriver && verifiedOrders.length > 0 && (
        <div className="rounded-md border border-dashed p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground flex-1">
              {verifiedOrders.length} order{verifiedOrders.length > 1 ? 's' : ''} ready for delivery.
            </p>
            <Button size="sm" onClick={() => setNewDeliveryOpen(true)}>
              <Package className="mr-1 h-4 w-4" />
              Create Deliveries
            </Button>
          </div>
        </div>
      )}

      {isDriver && (deliveries ?? []).length === 0 && (
        <div className="rounded-md border border-dashed p-12 text-center">
          <Truck className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-4 text-sm text-muted-foreground">
            No deliveries assigned yet.
          </p>
        </div>
      )}

      <DeliveryTable
        deliveries={(deliveries ?? []) as DeliveryWithRelations[]}
        isDriver={isDriver}
        onAssign={handleAssign}
        onStatusUpdate={handleStatusUpdate}
        updating={updateDelivery.isPending}
      />

      <DeliveryAssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        delivery={selectedDelivery}
        drivers={drivers}
        onAssign={handleAssignConfirm}
        isPending={updateDelivery.isPending}
      />

      <DeliveryConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={async (recipientName, notes) => {
          if (!confirmDeliveryId) return;
          const delivery = (deliveries ?? []).find((d) => d.id === confirmDeliveryId);
          await updateDelivery.mutateAsync({
            id: confirmDeliveryId,
            status: 'Delivered',
            delivered_at: new Date().toISOString(),
            recipient_name: recipientName,
            delivery_notes: notes || null,
          } as never);
          if (delivery?.order_id) {
            await supabase.from('sales_orders').update({ status: 'Delivered' }).eq('id', delivery.order_id);
          }
          setConfirmOpen(false);
          setConfirmDeliveryId(null);
        }}
        isPending={updateDelivery.isPending}
      />

      <Dialog open={newDeliveryOpen} onOpenChange={setNewDeliveryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Deliveries</DialogTitle>
            <DialogDescription>
              Select orders to create delivery records for.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {verifiedOrders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-medium">{o.order_id}</p>
                  <p className="text-sm truncate">{o.customers?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(o.total)} — {o.delivery_address || 'No address'}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    setCreatingIds((prev) => new Set(prev).add(o.id));
                    await handleCreateDelivery(o.id);
                    setCreatingIds((prev) => {
                      const next = new Set(prev);
                      next.delete(o.id);
                      return next;
                    });
                  }}
                  disabled={creatingIds.has(o.id)}
                >
                  {creatingIds.has(o.id) ? 'Adding...' : 'Add'}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

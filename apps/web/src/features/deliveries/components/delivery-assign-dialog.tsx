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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Tables } from '@pharma-ims/shared';

type DeliveryWithOrder = Tables<'deliveries'> & {
  sales_orders: Tables<'sales_orders'> & {
    customers: Pick<Tables<'customers'>, 'name' | 'address' | 'phone'> | null;
  };
};

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: DeliveryWithOrder | null;
  drivers: Tables<'users'>[];
  onAssign: (driverId: string, instructions: string) => void;
  isPending: boolean;
}

export function DeliveryAssignDialog({ open, onOpenChange, delivery, drivers, onAssign, isPending }: AssignDialogProps) {
  const [driverId, setDriverId] = useState('');
  const [instructions, setInstructions] = useState('');

  if (!delivery) return null;

  function handleAssign() {
    if (!driverId) return;
    onAssign(driverId, instructions);
    setDriverId('');
    setInstructions('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
          <DialogDescription>
            Select a delivery driver and add instructions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-muted p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order</span>
              <span className="font-mono">{delivery.sales_orders?.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{delivery.sales_orders?.customers?.name}</span>
            </div>
            {delivery.sales_orders?.customers?.address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="text-right max-w-48">{delivery.sales_orders.customers.address}</span>
              </div>
            )}
          </div>

          <div>
            <Label>Delivery Driver *</Label>
            <Select value={driverId} onValueChange={setDriverId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a driver..." />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.full_name} {d.phone ? `— ${d.phone}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Delivery Instructions</Label>
            <Textarea
              className="mt-1"
              placeholder="e.g. Call ahead 30 minutes before arrival"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!driverId || isPending}>
              {isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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

interface DeliveryConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (recipientName: string, notes: string) => void;
  isPending: boolean;
}

export function DeliveryConfirmDialog({ open, onOpenChange, onConfirm, isPending }: DeliveryConfirmDialogProps) {
  const [recipientName, setRecipientName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientName.trim()) {
      setError('Recipient name is required');
      return;
    }
    onConfirm(recipientName.trim(), notes.trim());
    setRecipientName('');
    setNotes('');
    setError('');
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) { setRecipientName(''); setNotes(''); setError(''); }
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirm Delivery</DialogTitle>
          <DialogDescription>Record delivery confirmation details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Recipient Name *</Label>
            <input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-3 text-base"
              placeholder="Customer or representative name"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Delivery Notes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-3 text-base min-h-[80px]"
              placeholder="Any additional notes..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>Confirm Delivery</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

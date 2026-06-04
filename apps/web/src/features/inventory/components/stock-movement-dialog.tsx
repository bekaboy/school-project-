import { useMemo } from 'react';
import { useAuditLogs } from '@/lib/supabase/queries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils/formatters';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export function StockMovementDialog({ open, onOpenChange, productId, productName }: Props) {
  const { data: logs, isLoading } = useAuditLogs();

  const movements = useMemo(() => {
    if (!logs) return [];
    return (logs as any[]).filter(
      (l: any) =>
        l.action === 'STOCK_ADJUST' &&
        l.entity_type === 'batch' &&
        l.details?.product === productName,
    );
  }, [logs, productName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Stock Movement — {productName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">Loading...</div>
        ) : movements.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No stock adjustments recorded for this product.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {movements.map((m: any) => (
              <div key={m.id} className="rounded-md border p-3 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{formatDateTime(m.created_at ?? '')}</span>
                  <Badge variant="default">STOCK ADJUST</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p><span className="text-muted-foreground">Batch:</span> <span className="font-mono">{m.details?.batch ?? '—'}</span></p>
                  <p><span className="text-muted-foreground">Reason:</span> {m.details?.reason ?? '—'}</p>
                  <p><span className="text-muted-foreground">Old Qty:</span> <span className="font-mono">{m.details?.old_qty}</span></p>
                  <p><span className="text-muted-foreground">New Qty:</span> <span className="font-mono">{m.details?.new_qty}</span></p>
                </div>
                {m.details?.note && (
                  <p className="text-xs text-muted-foreground italic">{m.details.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

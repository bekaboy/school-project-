import { useState, useMemo } from 'react';
import type { Tables } from '@pharma-ims/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils/formatters';
import { useSort } from '@/lib/utils/use-sort';
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

type BatchWithProduct = Tables<'batches'> & {
  products: Pick<Tables<'products'>, 'generic_name' | 'brand_name'> | null;
};

const PAGE_SIZE = 25;

function SortableHead({ label, sortKey, currentKey, direction, onClick, className }: {
  label: string; sortKey: string; currentKey: string | undefined; direction: 'asc' | 'desc';
  onClick: (key: string) => void; className?: string;
}) {
  const isActive = currentKey === sortKey;
  return (
    <TableHead className={`cursor-pointer select-none hover:text-foreground transition-colors ${className ?? ''}`} onClick={() => onClick(sortKey)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && <span className="text-primary text-xs">{direction === 'asc' ? '\u25B2' : '\u25BC'}</span>}
      </span>
    </TableHead>
  );
}

interface BatchTableProps {
  batches: BatchWithProduct[];
  onEdit: (batch: BatchWithProduct) => void;
  onDelete: (id: string) => void;
}

export function BatchTable({ batches, onEdit, onDelete }: BatchTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  const filtered = useMemo(() => {
    if (!search.trim()) return batches;
    const q = search.toLowerCase();
    return batches.filter(
      (b) =>
        b.batch_number.toLowerCase().includes(q) ||
        (b.products?.generic_name ?? '').toLowerCase().includes(q) ||
        (b.products?.brand_name ?? '').toLowerCase().includes(q) ||
        b.supplier.toLowerCase().includes(q),
    );
  }, [batches, search]);

  const { sorted, sortKey, sortDir, getSortProps } = useSort(filtered, 'expiry_date' as keyof BatchWithProduct);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function getExpiryStatus(expiryDate: string): 'expired' | 'expiring' | 'ok' {
    const date = new Date(expiryDate);
    if (date < now) return 'expired';
    if (date <= threeMonthsFromNow) return 'expiring';
    return 'ok';
  }

  function getStatusBadge(status: string | null) {
    const variant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      Active: 'default',
      Expired: 'destructive',
      Quarantined: 'outline',
    };
    return variant[status ?? ''] ?? 'secondary';
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search batches..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Batch #" sortKey="batch_number" currentKey={sortKey} direction={sortDir} onClick={getSortProps('batch_number' as keyof BatchWithProduct).onClick} />
              <TableHead>Product</TableHead>
              <SortableHead label="Supplier" sortKey="supplier" currentKey={sortKey} direction={sortDir} onClick={getSortProps('supplier' as keyof BatchWithProduct).onClick} />
              <SortableHead label="Received" sortKey="quantity_received" currentKey={sortKey} direction={sortDir} onClick={getSortProps('quantity_received' as keyof BatchWithProduct).onClick} className="text-right" />
              <SortableHead label="Remaining" sortKey="quantity_remaining" currentKey={sortKey} direction={sortDir} onClick={getSortProps('quantity_remaining' as keyof BatchWithProduct).onClick} className="text-right" />
              <SortableHead label="Mfg Date" sortKey="manufacturing_date" currentKey={sortKey} direction={sortDir} onClick={getSortProps('manufacturing_date' as keyof BatchWithProduct).onClick} />
              <SortableHead label="Expiry Date" sortKey="expiry_date" currentKey={sortKey} direction={sortDir} onClick={getSortProps('expiry_date' as keyof BatchWithProduct).onClick} />
              <SortableHead label="Status" sortKey="batch_status" currentKey={sortKey} direction={sortDir} onClick={getSortProps('batch_status' as keyof BatchWithProduct).onClick} />
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No batches found.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((batch) => {
                const expiryStatus = getExpiryStatus(batch.expiry_date);
                return (
                  <TableRow
                    key={batch.id}
                    className={
                      expiryStatus === 'expired'
                        ? 'bg-destructive/5'
                        : expiryStatus === 'expiring'
                          ? 'bg-amber-50 dark:bg-amber-950/20'
                          : ''
                    }
                  >
                    <TableCell className="font-mono text-xs">{batch.batch_number}</TableCell>
                    <TableCell className="font-medium">
                      {batch.products?.generic_name ?? 'Unknown'}
                      {batch.products?.brand_name ? ` (${batch.products.brand_name})` : ''}
                    </TableCell>
                    <TableCell>{batch.supplier}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {batch.quantity_received}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <span
                        className={
                          batch.quantity_remaining === 0
                            ? 'text-destructive'
                            : batch.quantity_remaining < batch.quantity_received * 0.1
                              ? 'text-amber-600 font-medium'
                              : ''
                        }
                      >
                        {batch.quantity_remaining}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(batch.manufacturing_date)}</TableCell>
                    <TableCell className="text-sm">
                      <span
                        className={
                          expiryStatus === 'expired'
                            ? 'text-destructive font-medium'
                            : expiryStatus === 'expiring'
                              ? 'text-amber-600 font-medium'
                              : ''
                        }
                      >
                        {formatDate(batch.expiry_date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(batch.batch_status)}>
                        {batch.batch_status ?? 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(batch)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(batch.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {pageItems.length} of {sorted.length} batches
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {safePage + 1} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

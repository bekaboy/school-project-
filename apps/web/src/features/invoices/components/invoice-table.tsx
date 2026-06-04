import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils/formatters';
import { Search, Download, FileText } from 'lucide-react';

interface InvoiceRow {
  id: string;
  invoice_number: string;
  invoice_date: string | null;
  created_at: string | null;
  pdf_url: string | null;
  order_id: string;
  order: {
    order_id: string;
    customer_name: string;
  };
}

interface InvoiceTableProps {
  invoices: InvoiceRow[];
  onGenerate: (orderId: string, salesOrderId: string) => void;
  generating: boolean;
}

export function InvoiceTable({ invoices, onGenerate, generating }: InvoiceTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return invoices;
    const q = search.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.order.order_id.toLowerCase().includes(q) ||
        inv.order.customer_name.toLowerCase().includes(q),
    );
  }, [invoices, search]);

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>PDF</TableHead>
              <TableHead className="w-36">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-medium">{inv.invoice_number}</TableCell>
                  <TableCell className="font-mono text-xs">{inv.order.order_id}</TableCell>
                  <TableCell>{inv.order.customer_name}</TableCell>
                  <TableCell className="text-sm">{formatDate(inv.invoice_date ?? inv.created_at ?? '')}</TableCell>
                  <TableCell>
                    {inv.pdf_url ? (
                      <a
                        href={inv.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-2"
                      >
                        <FileText className="h-4 w-4" />
                        View
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {!inv.pdf_url && (
                      <Button
                        size="sm"
                        onClick={() => onGenerate(inv.order_id, inv.id)}
                        disabled={generating}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Generate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {invoices.length} invoices
      </p>
    </div>
  );
}

import { useMemo } from 'react';
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
import { PaginationControls } from '@/components/ui/pagination-controls';
import { Search, Download, FileText } from 'lucide-react';
import { PAGE_SIZE } from '@/lib/utils/constants';

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
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onGenerate: (invoiceId: string) => void;
  generating: boolean;
}

export function InvoiceTable({ invoices, totalCount, page, onPageChange, search, onSearchChange, onGenerate, generating }: InvoiceTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
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
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
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
                    {!inv.pdf_url ? (
                      <Button
                        size="sm"
                        onClick={() => onGenerate(inv.id)}
                        disabled={generating}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Generate
                      </Button>
                    ) : (
                      <a
                        href={inv.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemLabel="invoices"
        showing={invoices.length}
        total={totalCount}
      />
    </div>
  );
}

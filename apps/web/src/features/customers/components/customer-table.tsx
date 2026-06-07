import { useMemo } from 'react';
import type { Tables } from '@pharma-ims/shared';
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
import { Badge } from '@/components/ui/badge';
import { formatPhone } from '@/lib/utils/formatters';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { Pencil, Trash2, Search, FileText } from 'lucide-react';
import { PAGE_SIZE } from '@/lib/utils/constants';

interface CustomerTableProps {
  customers: Tables<'customers'>[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onEdit: (customer: Tables<'customers'>) => void;
  onDelete: (id: string) => void;
  onViewOrders: (customer: Tables<'customers'>) => void;
}

export function CustomerTable({ customers, totalCount, page, onPageChange, search, onSearchChange, onEdit, onDelete, onViewOrders }: CustomerTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Tax ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.contact_person ?? '—'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatPhone(customer.phone)}
                  </TableCell>
                  <TableCell>{customer.email ?? '—'}</TableCell>
                  <TableCell className="max-w-48 truncate text-sm">{customer.address ?? '—'}</TableCell>
                  <TableCell className="font-mono text-xs">{customer.tax_id ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onViewOrders(customer)} title="View orders">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(customer)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(customer.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
        itemLabel="customers"
        showing={customers.length}
        total={totalCount}
      />
    </div>
  );
}

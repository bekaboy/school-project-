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
import { formatCurrency } from '@/lib/utils/formatters';
import { useSort } from '@/lib/utils/use-sort';
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

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

interface ProductTableProps {
  products: Tables<'products'>[];
  onEdit: (product: Tables<'products'>) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.generic_name.toLowerCase().includes(q) ||
        p.brand_name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.product_id.toLowerCase().includes(q),
    );
  }, [products, search]);

  const { sorted, sortKey, sortDir, getSortProps } = useSort(filtered, 'generic_name' as keyof Tables<'products'>);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="ID" sortKey="product_id" currentKey={sortKey} direction={sortDir} onClick={getSortProps('product_id' as keyof Tables<'products'>).onClick} />
              <SortableHead label="Generic Name" sortKey="generic_name" currentKey={sortKey} direction={sortDir} onClick={getSortProps('generic_name' as keyof Tables<'products'>).onClick} />
              <SortableHead label="Brand Name" sortKey="brand_name" currentKey={sortKey} direction={sortDir} onClick={getSortProps('brand_name' as keyof Tables<'products'>).onClick} />
              <SortableHead label="Strength" sortKey="strength" currentKey={sortKey} direction={sortDir} onClick={getSortProps('strength' as keyof Tables<'products'>).onClick} />
              <SortableHead label="Category" sortKey="category" currentKey={sortKey} direction={sortDir} onClick={getSortProps('category' as keyof Tables<'products'>).onClick} />
              <TableHead>Stock</TableHead>
              <SortableHead label="Unit Price" sortKey="selling_price" currentKey={sortKey} direction={sortDir} onClick={getSortProps('selling_price' as keyof Tables<'products'>).onClick} className="text-right" />
              <SortableHead label="Status" sortKey="active_status" currentKey={sortKey} direction={sortDir} onClick={getSortProps('active_status' as keyof Tables<'products'>).onClick} />
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs">{product.product_id}</TableCell>
                  <TableCell className="font-medium">{product.generic_name}</TableCell>
                  <TableCell>{product.brand_name}</TableCell>
                  <TableCell>{product.strength}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-xs">
                      See Inventory
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(product.selling_price)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.active_status ? 'default' : 'secondary'}>
                      {product.active_status ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)}>
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {Math.min(PAGE_SIZE, pageItems.length)} of {sorted.length} products
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

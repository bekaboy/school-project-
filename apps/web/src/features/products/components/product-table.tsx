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
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useSort } from '@/lib/utils/use-sort';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { Pencil, Trash2, Search, X, ImageIcon, Package } from 'lucide-react';
import { StatusLegend } from '@/components/status-legend';
import { useState } from 'react';
import { PAGE_SIZE } from '@/lib/utils/constants';

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
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  expiryMap?: Record<string, string>;
  batchStockMap?: Record<string, number>;
  onEdit: (product: Tables<'products'>) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({ products, totalCount, page, onPageChange, search, onSearchChange, expiryMap, batchStockMap, onEdit, onDelete }: ProductTableProps) {
  const [viewImage, setViewImage] = useState<string | null>(null);

  const { sorted, sortKey, sortDir, getSortProps } = useSort(products, 'generic_name' as keyof Tables<'products'>);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <StatusLegend />

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="ID" sortKey="product_id" currentKey={sortKey} direction={sortDir} onClick={getSortProps('product_id' as keyof Tables<'products'>).onClick} />
              <TableHead className="w-12">Image</TableHead>
              <SortableHead label="Generic Name" sortKey="generic_name" currentKey={sortKey} direction={sortDir} onClick={getSortProps('generic_name' as keyof Tables<'products'>).onClick} />
              <SortableHead label="Brand Name" sortKey="brand_name" currentKey={sortKey} direction={sortDir} onClick={getSortProps('brand_name' as keyof Tables<'products'>).onClick} />
              <SortableHead label="Strength" sortKey="strength" currentKey={sortKey} direction={sortDir} onClick={getSortProps('strength' as keyof Tables<'products'>).onClick} />
              <SortableHead label="Category" sortKey="category" currentKey={sortKey} direction={sortDir} onClick={getSortProps('category' as keyof Tables<'products'>).onClick} />
              <TableHead>Stock</TableHead>
              <TableHead>Expiry</TableHead>
              <SortableHead label="Unit Price" sortKey="selling_price" currentKey={sortKey} direction={sortDir} onClick={getSortProps('selling_price' as keyof Tables<'products'>).onClick} className="text-right" />
              <SortableHead label="Status" sortKey="active_status" currentKey={sortKey} direction={sortDir} onClick={getSortProps('active_status' as keyof Tables<'products'>).onClick} />
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-32 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs">{product.product_id}</TableCell>
                  <TableCell>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.generic_name}
                        className="h-10 w-10 cursor-pointer rounded-md object-cover border hover:opacity-80 transition-opacity"
                        onClick={() => setViewImage(product.image_url!)}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.generic_name}</TableCell>
                  <TableCell>{product.brand_name}</TableCell>
                  <TableCell>{product.strength}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 font-mono text-sm">
                      {batchStockMap?.[product.id] != null ? (
                        <>
                          <span className={`inline-block h-2 w-2 rounded-full ${
                            (batchStockMap[product.id] ?? 0) === 0 ? 'bg-destructive' :
                            product.reorder_quantity && (batchStockMap[product.id] ?? 0) < product.reorder_quantity ? 'bg-amber-500' : 'bg-green-500'
                          }`} />
                          <Package className="h-3 w-3 text-muted-foreground" />
                          {batchStockMap[product.id]}
                        </>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {(() => {
                      const expDate: string | undefined = expiryMap?.[product.id];
                      if (!expDate) return <span className="text-muted-foreground text-xs">—</span>;
                      const expiry = new Date(expDate);
                      const isExpiring = expiry > new Date() && expiry <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                      const isExpired = expiry < new Date();
                      const dotColor = isExpired ? 'bg-destructive' : isExpiring ? 'bg-orange-500' : 'bg-green-500';
                      return (
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
                          <span className={isExpired ? 'text-destructive font-medium' : isExpiring ? 'text-orange-600 font-medium' : ''}>
                            {formatDate(expDate)}
                          </span>
                        </span>
                      );
                    })()}
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

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemLabel="products"
        showing={sorted.length}
        total={totalCount}
      />

      {viewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setViewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-md hover:bg-accent transition-colors"
              onClick={() => setViewImage(null)}
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={viewImage}
              alt="Product"
              className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

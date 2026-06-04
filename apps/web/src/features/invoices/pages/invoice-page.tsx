import { useState } from 'react';
import { useInvoices } from '@/lib/supabase/queries';
import { InvoiceTable } from '@/features/invoices/components/invoice-table';
import { generateInvoiceForOrder } from '@/lib/utils/invoice-generator';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw } from 'lucide-react';

export function InvoicePage() {
  const { data: rawInvoices, isLoading, refetch } = useInvoices();
  const [generating, setGenerating] = useState(false);

  const invoices = ((rawInvoices ?? []) as any[]).map((inv: any) => ({
    id: inv.id,
    invoice_number: inv.invoice_number,
    invoice_date: inv.invoice_date,
    created_at: inv.created_at,
    pdf_url: inv.pdf_url,
    order_id: inv.order_id,
    order: {
      order_id: inv.sales_orders?.order_id ?? '—',
      customer_name: inv.sales_orders?.customers?.name ?? 'Unknown',
    },
  }));

  async function handleGenerate(orderId: string) {
    setGenerating(true);
    try {
      await generateInvoiceForOrder(orderId);
      await refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Generate and download invoices for verified orders.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {invoices.length === 0 && (
        <div className="rounded-md border border-dashed p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-4 text-sm text-muted-foreground">
            No invoices yet. Invoices are generated automatically when a payment is verified.
          </p>
        </div>
      )}

      <InvoiceTable
        invoices={invoices}
        onGenerate={handleGenerate}
        generating={generating}
      />
    </div>
  );
}

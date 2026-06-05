import { supabase } from '@/lib/supabase/client';
import { deductFifo } from './fifo';
import { generateInvoicePdf, downloadBlob } from '@/lib/pdf/invoice';
import { uploadInvoicePdf } from '@/lib/supabase/storage';

interface BatchStockItem {
  id: string;
  batchNumber: string;
  manufacturingDate: string;
  quantityRemaining: number;
}

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface DeductionPlan {
  batchId: string;
  quantityTaken: number;
}

export async function generateInvoiceForOrder(salesOrderId: string) {
  const { data: order, error: orderError } = await supabase
    .from('sales_orders')
    .select('*, order_items(*, products(*)), customers(*), invoices(*)')
    .eq('id', salesOrderId)
    .single();

  if (orderError) throw orderError;
  if (order.invoices && order.invoices.length > 0) {
    throw new Error('Invoice already exists for this order');
  }

  const { data: allBatches, error: batchError } = await supabase
    .from('batches')
    .select('*')
    .eq('batch_status', 'Active')
    .order('manufacturing_date');

  if (batchError) throw batchError;

  const deductions: { batchId: string; quantityTaken: number }[] = [];
  const batchUpdates: { id: string; quantity_remaining: number }[] = [];

  for (const item of order.order_items) {
    const productBatches = allBatches.filter(
      (b) => b.product_id === item.product_id && b.quantity_remaining > 0,
    );

    const fifoBatches: BatchStockItem[] = productBatches.map((b) => ({
      id: b.id,
      batchNumber: b.batch_number,
      manufacturingDate: b.manufacturing_date,
      quantityRemaining: b.quantity_remaining,
    }));

    const result = deductFifo(fifoBatches, item.quantity);

    for (const r of result) {
      deductions.push({ batchId: r.batchId, quantityTaken: r.quantityTaken });
      const batch = productBatches.find((b) => b.id === r.batchId);
      if (batch) {
        const alreadyPlanned = batchUpdates.find((u) => u.id === r.batchId);
        if (alreadyPlanned) {
          alreadyPlanned.quantity_remaining -= r.quantityTaken;
        } else {
          batchUpdates.push({ id: r.batchId, quantity_remaining: batch.quantity_remaining - r.quantityTaken });
        }
      }
    }
  }

  for (const update of batchUpdates) {
    const { error } = await supabase
      .from('batches')
      .update({ quantity_remaining: update.quantity_remaining })
      .eq('id', update.id);
    if (error) throw error;

    const deduction = deductions.find((d) => d.batchId === update.id);
    if (deduction) {
      await supabase.from('audit_logs').insert({
        action: 'FIFO_DEDUCT',
        entity_type: 'batch',
        entity_id: update.id,
        details: {
          order_id: salesOrderId,
          quantity_deducted: deduction.quantityTaken,
          new_remaining: update.quantity_remaining,
        },
        ip_address: '',
      });
    }
  }

  for (const item of order.order_items) {
    const itemDeductions = deductions.filter((d) => {
      const batch = allBatches.find((b) => b.id === d.batchId);
      return batch?.product_id === item.product_id;
    });

    if (itemDeductions.length > 0) {
      const deduction = itemDeductions[0]!;
      const { error } = await supabase
        .from('order_items')
        .update({ batch_id: deduction.batchId })
        .eq('id', item.id);
      if (error) throw error;
    }
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 90000) + 10000);
  const invNumber = `INV-${y}${m}${d}-${seq}`;
  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invNumber,
      order_id: salesOrderId,
      invoice_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (invError) throw invError;

  await supabase
    .from('sales_orders')
    .update({ status: 'Invoice Generated' })
    .eq('id', salesOrderId);

  const pdfData = {
    invoiceNumber: invNumber,
    orderId: order.order_id,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    customerName: order.customers?.name ?? '',
    customerAddress: order.customers?.address ?? '',
    customerPhone: order.customers?.phone ?? '',
    customerTaxId: order.customers?.tax_id ?? '',
    items: order.order_items.map((item: any) => ({
      description: `${item.products?.generic_name ?? 'Unknown'} (${item.products?.brand_name ?? ''}) - ${item.products?.strength ?? ''}`,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total_price,
    })),
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
  };

  const blob = await generateInvoicePdf(pdfData);
  downloadBlob(blob, `invoice-${invNumber}.pdf`);

  const pdfUrl = await uploadInvoicePdf(blob, invNumber);

  await supabase
    .from('invoices')
    .update({ pdf_url: pdfUrl })
    .eq('id', invoice.id);

  return invoice;
}

export async function regenerateInvoicePdf(invoiceId: string) {
  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .select('*, sales_orders(*, order_items(*, products(*)), customers(*))')
    .eq('id', invoiceId)
    .single();

  if (invError) throw invError;

  const order = invoice.sales_orders as any;
  const { data: allBatches } = await supabase
    .from('batches')
    .select('*')
    .eq('batch_status', 'Active')
    .order('manufacturing_date');

  const pdfData = {
    invoiceNumber: invoice.invoice_number,
    orderId: order.order_id,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    customerName: order.customers?.name ?? '',
    customerAddress: order.customers?.address ?? '',
    customerPhone: order.customers?.phone ?? '',
    customerTaxId: order.customers?.tax_id ?? '',
    items: order.order_items.map((item: any) => ({
      description: `${item.products?.generic_name ?? 'Unknown'} (${item.products?.brand_name ?? ''}) - ${item.products?.strength ?? ''}`,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total_price,
    })),
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
  };

  const blob = await generateInvoicePdf(pdfData);
  downloadBlob(blob, `invoice-${invoice.invoice_number}.pdf`);

  const pdfUrl = await uploadInvoicePdf(blob, invoice.invoice_number);

  await supabase
    .from('invoices')
    .update({ pdf_url: pdfUrl })
    .eq('id', invoice.id);
}

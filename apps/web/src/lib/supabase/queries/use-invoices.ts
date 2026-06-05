import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert } from '@pharma-ims/shared';

const queryKey = ['invoices'] as const;

export function useInvoices(page?: number, pageSize?: number, search?: string) {
  return useQuery({
    queryKey: [...queryKey, { page, pageSize, search }],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*, sales_orders(*, customers(*))', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (search) {
        const q = search.toLowerCase();
        query = query.or(
          `invoice_number.ilike.%${q}%,sales_orders.order_id.ilike.%${q}%`
        );
      }
      if (page != null && pageSize) {
        const from = page * pageSize;
        query = query.range(from, from + pageSize - 1);
      }
      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data ?? [], count: count ?? 0 };
    },
    placeholderData: (prev) => prev,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: [...queryKey, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, sales_orders(*, customers(*), order_items(*, products(*), batches(*)))')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useInvoiceByOrder(orderId: string) {
  return useQuery({
    queryKey: [...queryKey, 'order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase.from('invoices').select('*').eq('order_id', orderId).single();
      if (error) throw error;
      return data as Tables<'invoices'> | null;
    },
    enabled: !!orderId,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: TablesInsert<'invoices'>) => {
      const { data, error } = await supabase.from('invoices').insert(invoice).select().single();
      if (error) throw error;
      return data as Tables<'invoices'>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      qc.invalidateQueries({ queryKey: ['sales_orders'] });
    },
  });
}

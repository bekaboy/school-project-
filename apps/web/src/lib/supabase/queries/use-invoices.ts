import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert } from '@pharma-ims/shared';

const queryKey = ['invoices'] as const;

export function useInvoices() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, sales_orders(*, customers(*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
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

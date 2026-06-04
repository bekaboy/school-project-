import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '@pharma-ims/shared';

const queryKey = ['payments'] as const;

export function usePayments() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, sales_orders!inner(*, customers(*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function usePaymentByOrder(orderId: string) {
  return useQuery({
    queryKey: [...queryKey, 'order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase.from('payments').select('*').eq('order_id', orderId).single();
      if (error) throw error;
      return data as Tables<'payments'> | null;
    },
    enabled: !!orderId,
  });
}

export function usePaymentsByStatus(status: string) {
  return useQuery({
    queryKey: [...queryKey, 'status', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, sales_orders!inner(*, customers(*))')
        .eq('status', status)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!status,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: TablesInsert<'payments'>) => {
      const { data, error } = await supabase.from('payments').insert(payment).select().single();
      if (error) throw error;
      return data as Tables<'payments'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

export function useUpdatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: TablesUpdate<'payments'> & { id: string }) => {
      const { data, error } = await supabase.from('payments').update(values).eq('id', id).select().single();
      if (error) throw error;
      return data as Tables<'payments'>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
}

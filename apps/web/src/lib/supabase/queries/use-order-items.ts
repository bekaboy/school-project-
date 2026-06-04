import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Tables, TablesInsert } from '@pharma-ims/shared';

const queryKey = ['order_items'] as const;

export function useOrderItems(orderId: string) {
  return useQuery({
    queryKey: [...queryKey, 'order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, products(*), batches(*)')
        .eq('order_id', orderId);
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
}

export function useCreateOrderItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: TablesInsert<'order_items'>[]) => {
      const { data, error } = await supabase.from('order_items').insert(items).select();
      if (error) throw error;
      return data as Tables<'order_items'>[];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sales_orders'] }),
  });
}
